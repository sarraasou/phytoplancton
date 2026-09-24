from __future__ import annotations

import json
import re
import shutil
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional

import cv2
import numpy as np
import torch
import torchvision.transforms as T
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
from pydantic import BaseModel
import httpx

# ─────────────────────────────────────────────────────────────────
#  CONFIGURATION
# ─────────────────────────────────────────────────────────────────
RESNET_MODEL_CHOICE  = "resnet50"
CONFIDENCE_THRESHOLD = 0.50

CLASSES_RESNET = ["Karenia", "Alexandrium"]
CLASSES        = ["Karenia", "Alexandrium", "Autres"]

# ─────────────────────────────────────────────────────────────────
#  CHEMINS
# ─────────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent.absolute()
MODELS_DIR  = BASE_DIR / "models"
STATIC_DIR  = BASE_DIR / "static" / "results"
PENDING_DIR = BASE_DIR / "pending_crops"
DATASET_DIR = BASE_DIR / "dataset"
MASKS_DIR   = BASE_DIR / "static" / "masks"

for d in [STATIC_DIR, PENDING_DIR, MASKS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

for cls in CLASSES:
    (DATASET_DIR / cls).mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────
#  CHARGEMENT DES MODÈLES
# ─────────────────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Device : {DEVICE}")


def load_yolo():
    from ultralytics import YOLO
    for name in ["best.pt", "yolo26m_best.pt", "yolo_best.pt"]:
        p = MODELS_DIR / name
        if p.exists():
            m = YOLO(str(p))
            print(f"✅ YOLO    : {p.name} ({p.stat().st_size/1e6:.1f} Mo)")
            return m
    raise FileNotFoundError("Aucun checkpoint YOLO trouvé dans models/")


def load_sam2():
    try:
        from sam2.build_sam import build_sam2
        from sam2.sam2_image_predictor import SAM2ImagePredictor

        ckpt = MODELS_DIR / "sam2.1_hiera_base_plus.pt"
        if not ckpt.exists():
            print(f"⚠️  SAM2 : fichier manquant ({ckpt.name})")
            return None

        for cfg in [
            "configs/sam2.1/sam2.1_hiera_b+.yaml",
            "configs/sam2/sam2_hiera_b+.yaml",
        ]:
            try:
                model     = build_sam2(cfg, str(ckpt), device=DEVICE)
                predictor = SAM2ImagePredictor(model)
                print(f"✅ SAM2    : chargé ({cfg.split('/')[-1]})")
                return predictor
            except Exception as e_cfg:
                print(f"   cfg {cfg} échoué : {e_cfg}")
        return None
    except Exception as e:
        print(f"⚠️  SAM2 non disponible ({e})")
        return None


def load_resnet():
    import torchvision.models as tvm

    if RESNET_MODEL_CHOICE == "resnet18":
        names = ["resnet18_best.pt", "resnet50_best.pt"]
    else:
        names = ["resnet50_best.pt", "resnet18_best.pt"]

    for name in names:
        p = MODELS_DIR / name
        if not p.exists():
            continue
        try:
            print(f"   Chargement : {p.name}...")
            ckpt = torch.load(str(p), map_location=DEVICE, weights_only=False)

            n_classes = 2
            if isinstance(ckpt, dict):
                sd = ckpt.get("state_dict", ckpt.get("model", ckpt))
                sd = {k.replace("model.", ""): v for k, v in sd.items()}
                if "fc.weight" in sd:
                    n_classes = sd["fc.weight"].shape[0]
            elif hasattr(ckpt, "fc"):
                n_classes = ckpt.fc.out_features

            print(f"   → checkpoint : {n_classes} classe(s)")

            cur_arch = "resnet18" if "18" in name else "resnet50"
            model = (tvm.resnet18(weights=None) if cur_arch == "resnet18"
                     else tvm.resnet50(weights=None))
            model.fc = torch.nn.Linear(model.fc.in_features, n_classes)

            if isinstance(ckpt, dict):
                sd = ckpt.get("state_dict", ckpt.get("model", ckpt))
                sd = {k.replace("model.", ""): v for k, v in sd.items()}
                model.load_state_dict(sd, strict=True)
            else:
                model = ckpt

            model = model.to(DEVICE).eval()
            print(f"✅ ResNet   : {p.name} ({p.stat().st_size/1e6:.1f} Mo) "
                  f"[{cur_arch}, {n_classes} classes]")
            return model, n_classes

        except Exception as e:
            print(f"   ⚠️  {name} : {e}")

    print("⚠️  ResNet non chargé")
    return None, 0


yolo_model              = load_yolo()
sam2_pred               = load_sam2()
resnet_model, N_CLASSES = load_resnet()

RESNET_TRANSFORM = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# ─────────────────────────────────────────────────────────────────
#  APP FASTAPI
# ─────────────────────────────────────────────────────────────────
app = FastAPI(title="AlgaeVision AI API", version="5.3")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

print("=" * 55)
print("🔬  AlgaeVision API v5.3")
print(f"   YOLO    : {'✅' if yolo_model   else '❌'}")
print(f"   SAM2    : {'✅' if sam2_pred    else '❌'}")
print(f"   ResNet  : {'✅' if resnet_model else '❌'} ({N_CLASSES} classes)")
print(f"   Classes API  : {CLASSES}")
print(f"   Seuil conf   : {int(CONFIDENCE_THRESHOLD*100)}%")
print("=" * 55)


# ─────────────────────────────────────────────────────────────────
#  SCHÉMAS PYDANTIC
# ─────────────────────────────────────────────────────────────────
class ImageInput(BaseModel):
    id:  str
    url: str

class PredictionRequest(BaseModel):
    selectedImages: List[ImageInput]

class ValidationRequest(BaseModel):
    confirmed_class: str


# ─────────────────────────────────────────────────────────────────
#  UTILITAIRES
# ─────────────────────────────────────────────────────────────────
def safe_name(name: str) -> str:
    name = re.sub(r"[^\w\-.]", "_", name)
    return re.sub(r"_+", "_", name).strip("_")[:100]

def build_filename(species: str, crop_id: str, source_id: str) -> str:
    return f"{species.lower()}_{crop_id}_{safe_name(source_id)}.jpg"

def make_probs(class_name: str, confidence: float) -> dict:
    others = [c for c in CLASSES if c != class_name]
    rem    = round(1.0 - confidence, 4)
    p1     = round(rem * 0.6, 4)
    p2     = round(rem - p1, 4)
    return {class_name: confidence, others[0]: p1, others[1]: p2}

def resolve_path(url: str) -> Optional[Path]:
    url_clean = url.strip()
    if url_clean.startswith("http"):
        return None
    path_str = url_clean
    for prefix in ["/static/", "static/", "./static/", "../static/"]:
        if path_str.startswith(prefix):
            path_str = path_str[len(prefix):]
            break
    for candidate in [
        BASE_DIR / "static" / path_str,
        BASE_DIR / path_str,
        Path(path_str),
    ]:
        if candidate.exists():
            return candidate
    return None


async def fetch_image(url: str) -> Optional[np.ndarray]:
    try:
        if url.startswith("http"):
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.get(url)
                r.raise_for_status()
                data = r.content
        elif url.startswith("data:image"):
            import base64
            _, b64 = url.split(",", 1)
            data = base64.b64decode(b64)
        else:
            path = resolve_path(url)
            if path is None or not path.exists():
                print(f"   ❌ Fichier introuvable : {url}")
                return None
            data = path.read_bytes()
            print(f"   📂 Local : {path.name}")

        arr = np.frombuffer(data, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        if img is None:
            try:
                from io import BytesIO
                pil_img = Image.open(BytesIO(data)).convert("RGB")
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception as pil_err:
                print(f"   ❌ PIL échoué : {pil_err}")
                return None

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        print(f"   ✅ Image : {img_rgb.shape[1]}×{img_rgb.shape[0]}")
        return img_rgb

    except Exception as e:
        print(f"   ❌ fetch_image : {e}")
        return None


def crop_image(img_rgb: np.ndarray, box_xyxy: np.ndarray) -> np.ndarray:
    x1, y1, x2, y2 = box_xyxy.astype(int)
    h, w = img_rgb.shape[:2]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    crop = img_rgb[y1:y2, x1:x2]
    return crop if crop.size > 0 else img_rgb

def save_crop_jpg(crop_rgb: np.ndarray, out_path: Path) -> bool:
    try:
        bgr = cv2.cvtColor(crop_rgb, cv2.COLOR_RGB2BGR)
        ok  = cv2.imwrite(str(out_path), bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
        return ok
    except Exception as e:
        print(f"   ❌ save_crop : {e}")
        return False

def save_mask_png(mask: np.ndarray, out_path: Path,
                  color=(0, 200, 100)) -> bool:
    try:
        h, w = mask.shape
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[mask > 0] = [*color, 160]
        Image.fromarray(rgba).save(str(out_path))
        return True
    except Exception as e:
        print(f"   ❌ save_mask : {e}")
        return False


# ─────────────────────────────────────────────────────────────────
#  PIPELINE : YOLO → SAM2 → ResNet
# ─────────────────────────────────────────────────────────────────
def run_resnet(crop_rgb: np.ndarray) -> tuple[str, float, dict]:
    if resnet_model is None:
        return None, None, None
    try:
        pil_img = Image.fromarray(crop_rgb)
        inp     = RESNET_TRANSFORM(pil_img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            logits = resnet_model(inp)
            probs  = torch.softmax(logits, dim=1)[0].cpu().numpy()

        idx        = int(np.argmax(probs))
        confidence = float(probs[idx])
        raw_class  = (CLASSES_RESNET[idx]
                      if idx < len(CLASSES_RESNET) else CLASSES_RESNET[0])

        prob_dict: dict = {}
        for i, cls in enumerate(CLASSES_RESNET):
            prob_dict[cls] = round(float(probs[i]), 4)

        if confidence < CONFIDENCE_THRESHOLD:
            final_class = "Autres"
            prob_dict["Autres"] = round(confidence, 4)
            print(f"      ResNet={raw_class}({confidence:.0%}) "
                  f"→ Autres (< {int(CONFIDENCE_THRESHOLD*100)}%)")
        else:
            final_class = raw_class
            prob_dict["Autres"] = 0.0
            print(f"      ResNet={raw_class}({confidence:.0%})")

        return final_class, round(confidence, 4), prob_dict

    except Exception as e:
        print(f"   ❌ ResNet erreur : {e}")
        return None, None, None


def run_sam2(img_rgb: np.ndarray,
             box_xyxy: np.ndarray) -> Optional[np.ndarray]:
    if sam2_pred is None:
        return None
    try:
        sam2_pred.set_image(img_rgb)
        masks, scores, _ = sam2_pred.predict(
            box=box_xyxy[None].astype(np.float32),
            multimask_output=False,
        )
        best = int(np.argmax(scores))
        print(f"   ✅ SAM2 (score={scores[best]:.2f})")
        return masks[best].astype(np.uint8)
    except Exception as e:
        print(f"   ⚠️  SAM2 erreur : {e}")
        return None


async def process_one_image(img: ImageInput,
                            img_rgb: np.ndarray) -> dict:
    if img_rgb is None:
        return {
            "id": img.id,
            "result_image_path": "",
            "microalgues": [],
            "counts": {c: 0 for c in CLASSES},
            "error": "Image non chargée ou corrompue",
        }

    yolo_res = yolo_model(img_rgb, conf=0.15, iou=0.50, verbose=False)[0]
    boxes    = yolo_res.boxes.xyxy.cpu().numpy()
    confs    = yolo_res.boxes.conf.cpu().numpy()
    cls_ids  = yolo_res.boxes.cls.cpu().numpy().astype(int)

    print(f"   YOLO → {len(boxes)} détection(s)")

    if len(boxes) == 0:
        return {
            "id": img.id,
            "result_image_path": "",
            "microalgues": [],
            "counts": {c: 0 for c in CLASSES},
        }

    microalgues = []

    for i, (box, yolo_conf, yolo_cls) in enumerate(
            zip(boxes, confs, cls_ids)):
        crop_id    = str(uuid.uuid4())[:8]
        yolo_class = (CLASSES[int(yolo_cls)]
                      if int(yolo_cls) < len(CLASSES) else "Autres")
        print(f"   [{i+1}] YOLO={yolo_class} conf={float(yolo_conf):.2f}")

        # SAM2
        mask      = run_sam2(img_rgb, box)
        mask_path = None
        if mask is not None:
            mask_fname = f"{crop_id}_mask.png"
            if save_mask_png(mask, MASKS_DIR / mask_fname):
                mask_path = f"static/masks/{mask_fname}"

        # ResNet
        crop = crop_image(img_rgb, box)
        rn_class, rn_conf, rn_probs = run_resnet(crop)

        if rn_class is not None:
            final_class = rn_class
            final_conf  = rn_conf
            final_probs = rn_probs
        else:
            final_class = yolo_class
            final_conf  = float(round(float(yolo_conf), 4))
            final_probs = make_probs(final_class, final_conf)
            print(f"      ResNet absent → YOLO : {yolo_class}")

        # Sauvegarde crop
        fname    = build_filename(final_class, crop_id, img.id)
        crop_abs = STATIC_DIR / fname
        save_crop_jpg(crop, crop_abs)

        dataset_path = DATASET_DIR / final_class / fname
        bbox_list    = [float(round(float(v), 1)) for v in box]

        meta = {
            "crop_id":      crop_id,
            "image_id":     img.id,
            "image_url":    img.url,
            "pred_class":   final_class,
            "yolo_class":   yolo_class,
            "yolo_conf":    float(round(float(yolo_conf), 4)),
            "confidence":   float(final_conf),
            "probabilities": final_probs,
            "has_mask":     mask_path is not None,
            "mask_path":    mask_path,
            "bbox_xyxy":    bbox_list,
            "created_at":   datetime.now().isoformat(),
            "validated":    False,
            "crop_path":    f"static/results/{fname}",
            "dataset_path": str(dataset_path),
            "fname":        fname,
        }
        (PENDING_DIR / f"{crop_id}.json").write_text(
            json.dumps(meta, indent=2), encoding="utf-8"
        )

        microalgues.append({
            "crop_id":      crop_id,
            "id":           img.id,
            "url":          img.url,
            "class_name":   final_class,
            "yolo_class":   yolo_class,
            "confidence":   float(final_conf),
            "probabilities": final_probs,
            "image_path":   f"static/results/{fname}",
            "mask_path":    mask_path,
            "bbox":         bbox_list,
            "validated":    False,
            "filename":     fname,
        })

    counts = {
        c: sum(1 for m in microalgues if m["class_name"] == c)
        for c in CLASSES
    }
    print(f"   Résultat final : {counts}")
    return {
        "id":                img.id,
        "result_image_path": "",
        "microalgues":       microalgues,
        "counts":            counts,
    }


# ─────────────────────────────────────────────────────────────────
#  ENDPOINTS
# ─────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status":  "ok",
        "version": "5.3",
        "device":  str(DEVICE),
        "models": {
            "yolo":   yolo_model   is not None,
            "sam2":   sam2_pred    is not None,
            "resnet": resnet_model is not None,
        },
        "classes":               CLASSES,
        "resnet_trained_classes": CLASSES_RESNET,
        "confidence_threshold":  CONFIDENCE_THRESHOLD,
    }


@app.get("/health")
async def health():
    return {"status": "ok", "device": str(DEVICE)}


@app.post("/predict_from_urls")
async def predict_from_urls(payload: PredictionRequest):
    """Pipeline YOLO → SAM2 → ResNet.
    Retourne TOUS les crops par image, chacun avec son crop_id unique."""
    print(f"\n📥 {len(payload.selectedImages)} image(s) reçue(s)")
    results = []
    for img in payload.selectedImages:
        print(f"\n  📷 {img.id} | {img.url[:80]}")
        img_rgb = await fetch_image(img.url)
        result  = await process_one_image(img, img_rgb)
        results.append(result)
    return results


@app.post("/validate/{crop_id}")
async def validate_crop(crop_id: str, body: ValidationRequest):
    """
    Valide UN seul crop identifié par crop_id.
    L'expert peut corriger chaque crop indépendamment.
    """
    if body.confirmed_class not in CLASSES:
        raise HTTPException(
            400, f"Classe invalide. Acceptées : {CLASSES}"
        )

    meta_path = PENDING_DIR / f"{crop_id}.json"
    if not meta_path.exists():
        raise HTTPException(404, f"crop_id '{crop_id}' introuvable")

    meta        = json.loads(meta_path.read_text(encoding="utf-8"))
    was_correct = meta["pred_class"] == body.confirmed_class

    new_fname = build_filename(
        body.confirmed_class, crop_id, meta["image_id"]
    )
    dest_dir = DATASET_DIR / body.confirmed_class
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Supprimer les anciennes copies de CE crop dans TOUS les dossiers
    for cls in CLASSES:
        class_dir = DATASET_DIR / cls
        if not class_dir.exists():
            continue
        for old_file in class_dir.glob(f"*_{crop_id}_*"):
            if old_file.is_file():
                old_file.unlink()

    # Trouver le fichier source du crop
    crop_src = STATIC_DIR / meta["fname"]
    if not crop_src.exists():
        for cls in CLASSES:
            candidate = STATIC_DIR / build_filename(
                cls, crop_id, meta["image_id"]
            )
            if candidate.exists():
                crop_src = candidate
                break
        if not crop_src.exists():
            raise HTTPException(
                404, f"Crop source introuvable: {meta.get('fname')}"
            )

    shutil.copy2(crop_src, dest_dir / new_fname)

    meta.update({
        "dataset_path":    str(dest_dir / new_fname),
        "fname":           new_fname,
        "validated":       True,
        "confirmed_class": body.confirmed_class,
        "was_correct":     was_correct,
        "validated_at":    datetime.now().isoformat(),
    })
    meta_path.write_text(
        json.dumps(meta, indent=2), encoding="utf-8"
    )

    counts = {}
    for cls in CLASSES:
        p = DATASET_DIR / cls
        counts[cls] = (
            len([f for f in p.iterdir()
                 if f.suffix.lower() in (".jpg", ".png", ".jpeg")])
            if p.exists() else 0
        )

    return {
        "crop_id":        crop_id,
        "confirmed_class": body.confirmed_class,
        "was_correct":    was_correct,
        "correction": (
            "✅ Confirmé" if was_correct
            else f"✏️ {meta['pred_class']} → {body.confirmed_class}"
        ),
        "saved_filename":  new_fname,
        "saved_path":      str(dest_dir / new_fname),
        "total_validated": sum(counts.values()),
        "dataset_counts":  counts,
    }


@app.get("/dataset/stats")
async def dataset_stats():
    counts = {}
    for cls in CLASSES:
        p = DATASET_DIR / cls
        counts[cls] = (
            len([f for f in p.iterdir()
                 if f.suffix.lower() in (".jpg", ".png", ".jpeg")])
            if p.exists() else 0
        )
    pending = (
        len(list(PENDING_DIR.glob("*.json")))
        if PENDING_DIR.exists() else 0
    )
    return {
        "total":    sum(counts.values()),
        "by_class": counts,
        "pending":  pending,
    }


@app.get("/dataset/list")
async def dataset_list():
    result = {}
    for cls in CLASSES:
        p = DATASET_DIR / cls
        result[cls] = sorted([
            f.name for f in p.iterdir()
            if f.suffix.lower() in (".jpg", ".png", ".jpeg")
        ]) if p.exists() else []
    return result


def do_retrain():
    import subprocess
    import time
    script = BASE_DIR / "fine_tune.py"
    if script.exists():
        print("🚀 fine_tune.py ...")
        r = subprocess.run(
            [sys.executable, str(script)],
            capture_output=True, text=True
        )
        print(r.stdout[-2000:] if r.stdout else "")
        if r.returncode != 0:
            print(f"❌ {r.stderr[-500:]}")
    else:
        print("⚠️  fine_tune.py absent — simulation 5s")
        time.sleep(5)
    print("✅ Réentraînement terminé")


@app.post("/retrain")
async def retrain(background_tasks: BackgroundTasks):
    counts = {}
    total  = 0
    for cls in CLASSES:
        p = DATASET_DIR / cls
        n = (
            len([f for f in p.iterdir()
                 if f.suffix.lower() in (".jpg", ".png", ".jpeg")])
            if p.exists() else 0
        )
        counts[cls] = n
        total += n
    if total < 3:
        raise HTTPException(
            400, f"Seulement {total} image(s). Minimum 3 requis."
        )
    background_tasks.add_task(do_retrain)
    return {
        "status":         "started",
        "message":        f"Fine-tuning lancé sur {total} images",
        "dataset_counts": counts,
    }


@app.get("/debug/files")
async def debug_files():
    pending = [f.name for f in PENDING_DIR.glob("*.json")]
    static  = (
        [f.name for f in STATIC_DIR.iterdir()]
        if STATIC_DIR.exists() else []
    )
    dataset = {}
    for cls in CLASSES:
        p = DATASET_DIR / cls
        dataset[cls] = (
            [f.name for f in p.iterdir()
             if f.suffix.lower() in (".jpg", ".png", ".jpeg")]
            if p.exists() else []
        )
    return {
        "pending_crops":  pending,
        "static_results": static,
        "dataset":        dataset,
    }


@app.get("/debug/check_image/{path:path}")
async def debug_check_image(path: str):
    resolved = resolve_path(path)
    if resolved is None or not resolved.exists():
        return {"found": False, "path_tried": path}
    try:
        data = resolved.read_bytes()
        arr  = np.frombuffer(data, dtype=np.uint8)
        img  = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        return {
            "found":      True,
            "path":       str(resolved),
            "size_bytes": len(data),
            "shape":      list(img.shape) if img is not None else None,
            "cv2_ok":     img is not None,
        }
    except Exception as e:
        return {"found": True, "path": str(resolved), "error": str(e)}


# ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)