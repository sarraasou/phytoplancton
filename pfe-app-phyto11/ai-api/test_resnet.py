import torch
import torchvision.models as tvm
from pathlib import Path
from PIL import Image
import numpy as np

MODELS_DIR = Path("models")

print("🔍 Test ResNet50")
print("=" * 50)

# Charger modèle comme dans main.py
model = tvm.resnet50(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, 3)

ckpt = torch.load(MODELS_DIR / "resnet50_best.pt", map_location="cpu", weights_only=False)

if isinstance(ckpt, dict):
    sd = ckpt.get("state_dict", ckpt.get("model", {}))
    sd = {k.replace("model.", ""): v for k, v in sd.items()}
    model.load_state_dict(sd, strict=False)

model.eval()

# Test avec bruit aléatoire (pas représentatif mais test le modèle)
print("\n📊 Test avec images aléatoires:")
for i in range(5):
    test_img = torch.randn(1, 3, 224, 224)
    with torch.no_grad():
        out = model(test_img)
        probs = torch.softmax(out, dim=1)[0]
        pred_class = probs.argmax().item()
        conf = probs.max().item()
        print(f"   Image {i+1}: classe={pred_class} conf={conf:.2f}")

# Vérifier les poids de la dernière couche
print(f"\n📊 Poids FC:")
print(f"   weight shape: {model.fc.weight.shape}")
print(f"   bias shape: {model.fc.bias.shape}")
print(f"   bias values: {model.fc.bias}")