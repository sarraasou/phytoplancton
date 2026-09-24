from ultralytics import YOLO
import cv2

model = YOLO("models/yolo_best.pt")

# Test sur une image
img_path = "images/6feac3f2-175a-4050-82d8-2431e61c15bd.jpg"
img = cv2.imread(img_path)
print(f"Image: {img_path}")
print(f"Taille: {img.shape}")

# Test avec différentes confiances
for conf in [0.01, 0.05, 0.10, 0.25, 0.50]:
    results = model(img, conf=conf, verbose=False)
    n = len(results[0].boxes)
    print(f"  conf={conf}: {n} détection(s)")

# Afficher les classes disponibles dans le modèle
print(f"\nClasses YOLO: {model.names}")