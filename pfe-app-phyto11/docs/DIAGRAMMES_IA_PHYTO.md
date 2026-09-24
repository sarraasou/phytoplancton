# Diagrammes UML - Partie IA haute performance et haute précision

Ce document présente l'architecture IA de l'application Phyto/BioScan avec un objectif de haute performance, haute précision et réduction maximale des erreurs grâce à la validation experte.

## 1. Diagramme de composants de la partie IA

```mermaid
flowchart LR
U["Utilisateur autorisé<br/>Technicien / Expert / Admin"]

subgraph FRONT["Frontend Vue - Module Projet"]
PD["ProjectDetail.vue<br/>Sélection images, analyse, validation"]
AN["Tableau Analytics<br/>Pourcentages, graphiques, alertes"]
PERM["Contrôle des permissions<br/>canView / canAnnotate / canValidate"]
end

subgraph BACK["Backend NestJS"]
PROJ["ProjectController<br/>Projets, images, statistiques Karenia"]
ANN["AnnotationController<br/>Annotations persistées"]
NOTIF["NotificationController<br/>Analyse terminée, alerte bloom"]
AUTH["Auth + ProjectPermissionService<br/>Sécurité et droits d'accès"]
DBS["DbService / Prisma"]
end

subgraph AI["API IA FastAPI - AlgaeVision"]
PRED["Endpoint /predict_from_urls<br/>Prédiction IA"]
VAL["Endpoint /validate/{crop_id}<br/>Validation et correction expert"]
STATS["Endpoint /dataset/stats<br/>Statistiques dataset"]
TRAIN["Endpoint /retrain<br/>Réentraînement"]
PREP["Prétraitement image<br/>normalisation, contrôle format"]
DET["Détection YOLO<br/>localisation microalgues"]
CLS["Classification ResNet50<br/>Karenia / Alexandrium / Autres"]
CONF["Score de confiance<br/>probabilités par classe"]
DATASET["Dataset validé<br/>dataset/Karenia<br/>dataset/Alexandrium<br/>dataset/Autres"]
PENDING["Crops en attente<br/>pending_crops/*.json"]
RESULTS["Résultats statiques<br/>static/results"]
end

subgraph DATA["Base de données PostgreSQL"]
USER[("User")]
PROJECT[("Project")]
IMAGE[("Image")]
ANNOT[("Annotation")]
NOTIFICATION[("Notification")]
PERMISSION[("ProjectPermission")]
end

U --> PD
PD --> PERM
PERM --> AUTH
AUTH --> DBS
DBS --> DATA

PD -->|"Images sélectionnées"| PRED
PRED --> PREP
PREP --> DET
DET --> CLS
CLS --> CONF
CONF --> RESULTS
CONF --> PENDING
PRED -->|"Résultats IA"| PD

PD -->|"Créer notification analyse"| NOTIF
PD -->|"Alerte bloom si seuil atteint"| NOTIF
NOTIF --> DBS
DBS --> NOTIFICATION

PD -->|"Correction expert"| VAL
VAL --> PENDING
VAL --> DATASET
VAL -->|"Validation OK"| PD

PD -->|"Consulter dataset"| STATS
STATS --> DATASET
STATS --> AN

AN -->|"Demande amélioration modèle"| TRAIN
TRAIN --> DATASET
TRAIN -->|"Nouveau cycle d'apprentissage"| CLS

PROJ --> DBS
ANN --> DBS
DBS --> PROJECT
DBS --> IMAGE
DBS --> ANNOT
DBS --> USER
DBS --> PERMISSION
```

## 2. Diagramme d'activité de la partie IA

```mermaid
flowchart TD
Start([Début du processus IA])

Start --> Auth{Utilisateur authentifié ?}
Auth -- Non --> Login[Rediriger vers connexion]
Login --> EndDenied([Fin : accès refusé])

Auth -- Oui --> LoadProject[Charger le projet]
LoadProject --> CheckPerm{Droit canAnnotate ?}
CheckPerm -- Non --> Denied[Afficher accès refusé]
Denied --> EndDenied

CheckPerm -- Oui --> SelectImages[Sélectionner les images à analyser]
SelectImages --> ValidateInput{Images valides et disponibles ?}
ValidateInput -- Non --> InputError[Afficher erreur de sélection]
InputError --> SelectImages

ValidateInput -- Oui --> SendAI[Envoyer les images à l'API IA]
SendAI --> Preprocess[Prétraiter les images<br/>format, taille, normalisation]
Preprocess --> Detect[Détecter les microalgues<br/>modèle YOLO]
Detect --> Crop[Extraire les zones détectées]
Crop --> Classify[Classifier chaque crop<br/>ResNet50]
Classify --> Confidence[Calculer les probabilités<br/>Karenia, Alexandrium, Autres]

Confidence --> Quality{Confiance suffisante ?}
Quality -- Non --> FlagReview[Marquer comme à vérifier]
Quality -- Oui --> AcceptPrediction[Préparer prédiction IA]
FlagReview --> MergeResults
AcceptPrediction --> MergeResults[Regrouper résultats par image]

MergeResults --> Display[Afficher résultats, classes et scores]
Display --> ComputeStats[Calculer statistiques<br/>total cellules, % Karenia, % Alexandrium]

ComputeStats --> Bloom{Seuil bloom atteint ?}
Bloom -- Oui --> CreateAlert[Créer alerte bloom<br/>ADMIN / EXPERT]
Bloom -- Non --> WaitValidation[Attendre validation experte]
CreateAlert --> WaitValidation

WaitValidation --> CanValidate{Droit canValidate ?}
CanValidate -- Non --> ReadOnly[Afficher résultats en lecture seule]
ReadOnly --> EndRead([Fin : consultation])

CanValidate -- Oui --> ExpertReview[L'expert vérifie les prédictions]
ExpertReview --> Correction{Classe correcte ?}
Correction -- Oui --> Confirm[Confirmer la classe]
Correction -- Non --> Correct[Corriger la classe]

Confirm --> SaveDataset[Enregistrer crop dans dataset validé]
Correct --> SaveDataset
SaveDataset --> SaveAnnotation[Mettre à jour les annotations]
SaveAnnotation --> NotifyValidation[Créer notification de validation]
NotifyValidation --> RefreshStats[Actualiser analytics et dataset]

RefreshStats --> RetrainDecision{Dataset suffisant pour réentraînement ?}
RetrainDecision -- Non --> End([Fin])
RetrainDecision -- Oui --> AskRetrain{Expert/Admin lance réentraînement ?}
AskRetrain -- Non --> End
AskRetrain -- Oui --> Retrain[Lancer /retrain en tâche de fond]
Retrain --> Evaluate[Évaluer le modèle amélioré]
Evaluate --> Deploy{Performance et précision meilleures ?}
Deploy -- Non --> KeepOld[Conserver modèle précédent]
Deploy -- Oui --> UpdateModel[Mettre à jour le modèle IA]
KeepOld --> End
UpdateModel --> End
```

## 3. Version courte pour le rapport

### Diagramme de composants - résumé

```mermaid
flowchart LR
UI["Frontend Vue<br/>ProjectDetail + Analytics"]
API["Backend NestJS<br/>Sécurité, projets, notifications"]
IA["API IA FastAPI<br/>YOLO + ResNet50"]
DB[("PostgreSQL<br/>Users, Projects, Images, Annotations")]
DS[("Dataset IA validé<br/>Karenia / Alexandrium / Autres")]

UI -->|"sélection images"| IA
IA -->|"prédictions + confiance"| UI
UI -->|"corrections expert"| IA
IA -->|"crops validés"| DS
UI -->|"notifications, annotations"| API
API --> DB
IA -->|"stats dataset"| UI
DS -->|"réentraînement"| IA
```

### Diagramme d'activité IA - résumé

```mermaid
flowchart TD
A([Début]) --> B[Sélectionner images]
B --> C[Prétraiter images]
C --> D[Détection YOLO]
D --> E[Classification ResNet50]
E --> F[Calcul des probabilités]
F --> G[Afficher résultats IA]
G --> H{Seuil bloom atteint ?}
H -- Oui --> I[Créer alerte bloom]
H -- Non --> J[Validation expert]
I --> J
J --> K{Classe correcte ?}
K -- Oui --> L[Confirmer annotation]
K -- Non --> M[Corriger annotation]
L --> N[Mettre à jour dataset]
M --> N
N --> O{Dataset suffisant ?}
O -- Oui --> P[Réentraîner modèle]
O -- Non --> Q([Fin])
P --> R[Évaluer précision]
R --> Q
```

## 4. Points de qualité pour haute précision

| Objectif | Mécanisme proposé |
|---|---|
| Haute précision | Classification avec score de confiance et validation experte obligatoire pour les cas sensibles. |
| Zéro faute métier | Toute prédiction douteuse passe par une étape de vérification humaine avant d'alimenter le dataset. |
| Haute performance | Traitement par lot des images sélectionnées, séparation frontend/backend/API IA, et tâche de fond pour le réentraînement. |
| Traçabilité | Chaque crop possède un `crop_id`, une classe prédite, une classe confirmée et un chemin dataset. |
| Amélioration continue | Les corrections expertes enrichissent le dataset, puis déclenchent un réentraînement contrôlé. |
| Alertes fiables | Les alertes bloom sont déclenchées selon un seuil et dédupliquées côté backend. |
