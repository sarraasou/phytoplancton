"""
Convertir resnet18_best.pt de 2 classes → 3 classes
puis sauvegarder le nouveau modèle
"""

import torch
import torchvision.models as tvm
from pathlib import Path

MODELS_DIR = Path("models")
SRC = MODELS_DIR / "resnet18_best.pt"
DST = MODELS_DIR / "resnet18_3classes_best.pt"

# Classes cibles
CLASSES = ["Karenia", "Alexandrium", "Autres"]

print(f"📂 Chargement: {SRC}")
ckpt = torch.load(SRC, map_location="cpu", weights_only=False)

# Charger le modèle original (2 classes)
model = tvm.resnet18(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, 2)

# Charger les poids
if isinstance(ckpt, dict):
    sd = ckpt.get("state_dict", ckpt.get("model", {}))
    sd = {k.replace("model.", ""): v for k, v in sd.items()}
    model.load_state_dict(sd, strict=False)
else:
    model = ckpt

print(f"✅ Modèle chargé: 2 classes")

# Créer nouveau modèle avec 3 classes
new_model = tvm.resnet18(weights=None)
new_model.fc = torch.nn.Linear(new_model.fc.in_features, 3)

# Copier les poids des 2 classes existantes
with torch.no_grad():
    new_model.fc.weight[:2] = model.fc.weight
    new_model.fc.bias[:2] = model.fc.bias
    # Initialiser la 3ème classe avec des valeurs aléatoires
    torch.nn.init.xavier_uniform_(new_model.fc.weight[2:3])
    new_model.fc.bias[2] = 0.0

print(f"✅ Conversion 2→3 classes terminée")

# Sauvegarder
torch.save(new_model.state_dict(), DST)
print(f"💾 Sauvegardé: {DST}")

# Vérifier
test = torch.randn(1, 3, 224, 224)
out = new_model(test)
print(f"✅ Sortie: {out.shape} (batch=1, classes=3)")