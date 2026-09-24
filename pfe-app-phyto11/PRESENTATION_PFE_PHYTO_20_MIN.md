# Presentation PFE - Application intelligente de detection et suivi des microalgues

Objectif : presentation professionnelle de 20 minutes devant le jury.

Style visuel recommande :
- Palette : bleu profond `#0B1F33`, vert scientifique `#1B8A5A`, cyan analytique `#19A7CE`, blanc casse `#F7FAFC`, gris texte `#334155`, alerte bloom `#E85D04`.
- Typographie : Inter, Poppins ou Aptos.
- Regle : peu de texte sur les slides, discours oral plus detaille dans les notes.
- Format : 16:9, fond clair, titres courts, schema ou capture sur chaque slide importante.

---

## Slide 1 - Titre du PFE

Temps : 45 secondes

Contenu ecran :
- Application intelligente pour la detection, classification et suivi des microalgues
- Cas d'etude : Karenia, Alexandrium et autres especes
- PFE 2025 - Nom, encadrant, etablissement

Image :
Microscope moderne avec cellules de microalgues, interface numerique en arriere-plan.

Description image :
Cette image introduit le lien entre biologie marine, observation microscopique et systeme intelligent d'aide a la decision.

Prompt Nano Banana :
```
Professional scientific presentation cover, modern laboratory microscope observing marine microalgae, subtle digital AI interface overlay with detection boxes and analytics charts, clean blue green color palette, premium academic style, high resolution, realistic, sharp details, 16:9, no text
```

Discours :
Bonjour. Je vais vous presenter mon projet de fin d'etudes : une application intelligente dediee a l'analyse des images microscopiques de microalgues. L'objectif est de faciliter la detection, la classification et le suivi des especes importantes, notamment Karenia et Alexandrium, avec une interface web, un backend securise et un module d'intelligence artificielle.

---

## Slide 2 - Contexte general

Temps : 1 minute

Contenu ecran :
- Les microalgues jouent un role important dans les ecosystemes aquatiques.
- Certaines especes peuvent provoquer des blooms algaux.
- Le suivi repose souvent sur l'observation microscopique et l'expertise humaine.
- Besoin : accelerer l'analyse tout en gardant la validation experte.

Image :
Comparaison entre analyse manuelle au microscope et analyse assistee par IA.

Description image :
L'image montre que l'application ne remplace pas l'expert, mais lui apporte un support rapide, structure et traçable.

Prompt Nano Banana :
```
Split scene showing a marine biology expert analyzing microscope images on the left, and an AI-assisted web dashboard detecting microalgae on the right, realistic lab environment, clean scientific UI, blue green palette, professional academic slide image, 16:9, no text
```

Discours :
Dans le domaine de la surveillance environnementale, l'analyse des microalgues est une activite sensible. Certaines especes peuvent indiquer un risque ecologique ou sanitaire lorsqu'elles deviennent dominantes. Traditionnellement, l'identification se fait par observation manuelle, ce qui demande du temps, de l'experience et une forte concentration. Le contexte de ce projet est donc de proposer un outil qui accelere l'analyse, organise les donnees et assiste l'expert sans supprimer son role de validation.

---

## Slide 3 - Analyse de l'existant

Temps : 1 minute

Contenu ecran :
- Observation manuelle : precise mais lente.
- Stockage disperse : images, resultats et annotations difficiles a centraliser.
- Faible automatisation : peu d'aide pour compter et classifier.
- Traçabilite limitee : corrections et historiques difficiles a exploiter.

Image :
Workflow manuel avec plusieurs fichiers, notes papier et microscope.

Description image :
Cette image illustre les limites de l'existant : fragmentation, lenteur et absence de cycle d'amelioration automatique.

Prompt Nano Banana :
```
Professional workflow illustration of a traditional manual microalgae analysis process, microscope, scattered image files, handwritten notes, spreadsheet, slow fragmented workflow, subtle contrast with a clean digital system in background, realistic, high quality, 16:9, no text
```

Discours :
L'analyse de l'existant montre quatre limites principales. Premierement, l'analyse manuelle est fiable mais lente. Deuxiemement, les images, annotations et resultats peuvent etre disperses. Troisiemement, le comptage et la classification sont repetitifs et peu automatises. Enfin, les corrections expertes ne sont pas toujours reutilisees pour ameliorer le systeme. Ces limites motivent la creation d'une application integree.

---

## Slide 4 - Problematique et motivation

Temps : 1 minute

Contenu ecran :
Problematique :
Comment concevoir une application capable d'analyser des images de microalgues, de proposer des predictions IA fiables, de permettre la validation experte et de generer des alertes exploitables ?

Motivations :
- Gagner du temps.
- Reduire les erreurs repetitives.
- Centraliser les projets et annotations.
- Construire un dataset valide pour l'amelioration continue.

Image :
Entonnoir decisionnel : image brute -> IA -> validation expert -> alerte/statistiques.

Description image :
L'image resume la transformation d'une image microscopique brute en information exploitable par un expert.

Prompt Nano Banana :
```
Scientific decision pipeline, raw microscope microalgae image flowing into AI detection module, then expert validation, then analytics and alert dashboard, modern clean infographic style, blue green orange accents, high resolution, 16:9, no text
```

Discours :
La problematique centrale est de passer d'une image brute a une information fiable. Pour cela, l'application doit detecter les microalgues, classifier les especes, calculer les statistiques, signaler les risques de bloom et permettre a l'expert de confirmer ou corriger les resultats. La motivation principale est donc double : ameliorer la performance de l'analyse et conserver la rigueur scientifique par la validation humaine.

---

## Slide 5 - Objectifs du PFE

Temps : 1 minute 15

Contenu ecran :
- Creer une application web de gestion des projets d'analyse.
- Importer et organiser les images microscopiques.
- Lancer une analyse IA sur les images selectionnees.
- Detecter, segmenter et classifier les microalgues.
- Valider ou corriger les predictions.
- Suivre les statistiques et alertes bloom.
- Enrichir le dataset pour le reentrainement.

Image :
Carte fonctionnelle de l'application.

Description image :
Cette image presente les grands blocs fonctionnels : projet, images, IA, validation, analytics, notifications et administration.

Prompt Nano Banana :
```
Modern software feature map for an AI microalgae analysis platform, modules for projects, image upload, AI detection, expert validation, analytics dashboard, bloom alerts, administration, clean professional UI diagram, blue green palette with orange alerts, 16:9, no text
```

Discours :
Les objectifs du PFE sont operationnels et techniques. L'application doit gerer des projets, importer des images, lancer l'analyse IA, afficher les resultats, permettre la validation experte et produire des statistiques. Elle doit aussi gerer les utilisateurs, les droits d'acces, les notifications et les alertes. Enfin, elle doit integrer une logique d'apprentissage continu : chaque correction experte devient une donnee utile pour ameliorer le modele.

---

## Slide 6 - Methodologie de conduite du projet : Waterfall

Temps : 1 minute

Contenu ecran :
1. Analyse des besoins
2. Conception
3. Implementation
4. Tests et validation
5. Livraison et documentation

Image :
Cascade Waterfall adaptee au projet.

Description image :
Le schema montre que le projet suit une progression structuree : comprendre, concevoir, developper, tester puis livrer.

Prompt Nano Banana :
```
Professional waterfall project methodology diagram for a software engineering project, phases requirements analysis, design, implementation, testing, delivery, clean corporate academic style, subtle blue green palette, high resolution, 16:9, no text
```

Discours :
Pour conduire le projet, j'ai adopte une methode de type Waterfall. Cette methode convient au PFE car les besoins principaux etaient definis progressivement puis formalises avant l'implementation. J'ai commence par l'analyse des acteurs et des cas d'utilisation, puis la conception de l'architecture, ensuite le developpement des modules frontend, backend et IA, et enfin la validation fonctionnelle.

---

## Slide 7 - Analyse des besoins et acteurs

Temps : 1 minute 15

Contenu ecran :
Acteurs :
- Visiteur : inscription, connexion.
- Technicien : creation projet, import images, analyse.
- Expert : validation, correction, reentrainement.
- Administrateur : utilisateurs, permissions, modeles, alertes.

Besoins :
- Securite des comptes.
- Droits par projet.
- Analyse IA.
- Traçabilite des annotations.

Image :
Diagramme de cas d'utilisation simplifie.

Description image :
Le diagramme positionne les acteurs autour des fonctionnalites principales de l'application.

Prompt Nano Banana :
```
Clean UML use case style diagram illustration for a microalgae AI web application, actors visitor technician expert administrator around system functions login projects image upload AI analysis validation analytics permissions notifications, professional academic style, 16:9, no text
```

Discours :
L'analyse des besoins a permis d'identifier quatre profils. Le technicien prepare les projets et les images. L'expert intervient sur les resultats IA pour les confirmer ou les corriger. L'administrateur gere les utilisateurs, les droits et la configuration. Cette separation est importante, car l'application manipule des donnees scientifiques et des decisions sensibles. Elle doit donc etre fonctionnelle, mais aussi securisee et traçable.

---

## Slide 8 - Conception : diagramme de composants

Temps : 1 minute 15

Contenu ecran :
- Frontend Vue : interface utilisateur, projets, analytics, validation.
- Backend NestJS : API metier, securite, permissions, notifications.
- API IA FastAPI : prediction, validation, dataset, reentrainement.
- PostgreSQL/Supabase : persistance des donnees.
- Docker/Kong : orchestration et gateway.

Image a utiliser :
`Figures/chapter4/architecture_generale_simple.svg` ou `Figures/chapter4/ai_architecture.svg`

Description image :
Ce diagramme explique la separation des responsabilites entre interface, logique metier, intelligence artificielle et base de donnees.

Prompt Nano Banana :
```
High quality software architecture diagram, Vue frontend connected to NestJS backend, FastAPI AI service, PostgreSQL database, Supabase auth, Kong API gateway, Docker containers, scientific microalgae analysis platform, clean professional diagram, 16:9, no text
```

Discours :
La conception repose sur une architecture modulaire. Le frontend Vue gere l'experience utilisateur. Le backend NestJS centralise la logique metier : projets, utilisateurs, permissions, notifications et annotations. L'API IA FastAPI est separee pour isoler le traitement machine learning. La base PostgreSQL assure la persistance. Cette separation rend le systeme plus maintenable, plus securise et plus facile a faire evoluer.

---

## Slide 9 - Architecture physique

Temps : 1 minute

Contenu ecran :
- Client UI : port 3001
- Backend NestJS : port 3005
- API IA : port 8001
- Kong Gateway : port 8015
- PostgreSQL : port 5433
- Services conteneurises avec Docker Compose

Image a utiliser :
`Figures/chapter4/docker_containers.svg`

Description image :
L'image montre le deploiement des services et leurs communications dans l'environnement technique.

Prompt Nano Banana :
```
Physical deployment architecture diagram with Docker containers for Vue frontend, NestJS API, FastAPI AI service, Kong gateway, PostgreSQL database and Supabase Auth, clean infrastructure view, professional academic style, 16:9, no text
```

Discours :
Sur le plan physique, l'application est organisee en plusieurs services. Le frontend, le backend, l'API IA, la base de donnees, Kong et le service d'authentification fonctionnent comme des composants separes. Docker Compose facilite le lancement et la coherence de l'environnement. Cette organisation permet aussi d'isoler les pannes et de faire evoluer un service sans reconstruire toute l'application.

---

## Slide 10 - Architecture frontend

Temps : 1 minute

Contenu ecran :
Technologies :
- Vue 3 + TypeScript
- Vite
- Pinia
- Vue Router
- Axios
- ApexCharts / Chart.js
- Bootstrap / Sass

Fonctions :
- Authentification
- Liste et detail des projets
- Import images
- Resultats IA
- Analytics
- Permissions

Image a utiliser :
`Figures/chapter4/frontend_architecture.svg`

Description image :
Cette image presente le frontend comme point d'interaction principal entre utilisateur, backend et module IA.

Prompt Nano Banana :
```
Modern frontend architecture illustration for Vue 3 web application, components dashboard, project list, image gallery, AI results, validation panel, analytics charts, permissions, clean UI wireframe style, professional, 16:9, no text
```

Discours :
Le frontend est developpe avec Vue 3. Il offre les ecrans de connexion, de gestion des projets, de detail projet, d'import d'images, de validation IA et de visualisation analytique. Les appels API sont faits avec Axios. Les graphiques sont produits avec ApexCharts ou Chart.js. L'objectif du frontend est de rendre le processus d'analyse fluide : selectionner, analyser, verifier et interpreter.

---

## Slide 11 - Architecture backend

Temps : 1 minute

Contenu ecran :
Technologies :
- NestJS
- Prisma
- PostgreSQL
- Supabase Auth
- Swagger
- JWT / roles / permissions

Modules :
- Auth, User, Project, Image
- Annotation, AiModel
- ProjectPermission
- Notification
- AppConfig

Image a utiliser :
`Figures/chapter4/backend_architecture.svg`

Description image :
L'image montre le backend comme couche de securite et de logique metier entre l'interface et la base de donnees.

Prompt Nano Banana :
```
Professional backend architecture diagram for NestJS application, modules auth users projects images annotations AI models permissions notifications app config, Prisma ORM, PostgreSQL database, Supabase auth, Swagger API docs, clean technical style, 16:9, no text
```

Discours :
Le backend est construit avec NestJS. Il gere les entites principales : utilisateurs, projets, images, annotations, modeles IA, permissions et notifications. Prisma assure la communication avec PostgreSQL. Le backend applique les droits d'acces, par exemple `canView`, `canUpload`, `canAnnotate`, `canValidate`, `canEdit` et `canDelete`. C'est une couche essentielle pour garantir que chaque utilisateur voit uniquement les projets autorises.

---

## Slide 12 - Module IA : vue globale CRISP-DM

Temps : 1 minute 15

Contenu ecran :
CRISP-DM applique au module IA :
1. Business understanding : besoin d'identification rapide.
2. Data understanding : images microscopiques.
3. Data preparation : nettoyage, crops, normalisation, augmentation.
4. Modeling : YOLO, SAM2, ResNet.
5. Evaluation : confiance, validation expert.
6. Deployment : API FastAPI integree.

Image :
Cycle CRISP-DM adapte a l'IA microalgues.

Description image :
Cette image explique que l'IA n'est pas seulement un modele, mais un processus complet allant du besoin metier au deploiement.

Prompt Nano Banana :
```
CRISP-DM cycle adapted for AI microalgae detection, six phases business understanding data understanding data preparation modeling evaluation deployment, with microscope images and AI model icons, clean professional scientific infographic, 16:9, no text
```

Discours :
Pour la partie IA, j'ai suivi la logique CRISP-DM. Cette methode structure les projets data science. Elle commence par la comprehension du besoin metier, puis l'analyse des donnees, leur preparation, la modelisation, l'evaluation et le deploiement. Dans notre cas, le module IA ne se limite pas a predire une classe : il detecte, segmente, classifie, donne un score de confiance et attend la validation de l'expert.

---

## Slide 13 - Module IA 1 : collecte et preparation des donnees

Temps : 1 minute 15

Contenu ecran :
- Donnees : images microscopiques de microalgues.
- Classes : Karenia, Alexandrium, Autres.
- Preparation :
  - chargement local/URL/data image
  - controle format image
  - extraction des crops
  - normalisation 224x224
  - stockage dans dataset par classe
- Data augmentation :
  - rotations, flips, variations luminosite/contraste
  - objectif : robustesse du modele

Image :
Pipeline data augmentation.

Description image :
L'image montre une image de microalgue transformee en plusieurs variantes pour enrichir le dataset.

Prompt Nano Banana :
```
Scientific data augmentation pipeline for microalgae microscope images, one original cell image transformed into rotations, flips, brightness and contrast variations, clean grid layout, AI dataset preparation, professional academic style, high resolution, 16:9, no text
```

Discours :
La premiere etape CRISP-DM concerne la preparation des donnees. Les images peuvent venir de chemins locaux, d'URL ou de donnees encodees. Le systeme verifie leur chargement, puis extrait les zones pertinentes sous forme de crops. Ces crops sont normalises avant la classification. La data augmentation est importante, car elle permet d'augmenter artificiellement la diversite du dataset avec des rotations, des retournements et des variations de contraste. Cela aide le modele a generaliser sur des images microscopiques qui ne sont jamais parfaitement identiques.

---

## Slide 14 - Module IA 2 : detection avec YOLO

Temps : 1 minute

Contenu ecran :
- Role : localiser les microalgues dans l'image.
- Entree : image microscopique.
- Sortie : boites de detection, classe YOLO, score de confiance.
- Parametres : confiance 0.15, IoU 0.50.
- Resultat : chaque detection devient un crop independant.

Image :
Image microscope avec bounding boxes autour des microalgues.

Description image :
L'image montre le role de YOLO : reperer les cellules avant de les classifier plus finement.

Prompt Nano Banana :
```
Microscope image of marine microalgae with AI object detection bounding boxes around individual cells, YOLO style visual overlay, clean scientific visualization, realistic, sharp, blue green color accents, high resolution, 16:9, no text
```

Discours :
Le premier modele utilise dans le pipeline est YOLO. Son role est de localiser les microalgues dans l'image. Il produit des boites de detection et un score de confiance. Cette etape est importante parce qu'une image peut contenir plusieurs cellules. Chaque cellule detectee est ensuite traitee comme un crop independant, ce qui permet une validation fine par l'expert.

---

## Slide 15 - Module IA 3 : segmentation SAM2 et classification ResNet50

Temps : 1 minute 30

Contenu ecran :
SAM2 :
- Segmentation optionnelle des zones detectees.
- Generation de masques visuels.

ResNet50 :
- Classification du crop.
- Classes principales : Karenia, Alexandrium.
- Si confiance < 50 % : classe finale = Autres.
- Sortie : probabilites par classe.

Image :
Trois etapes : crop -> masque -> classe + probabilites.

Description image :
Cette image explique la combinaison entre localisation, segmentation et classification.

Prompt Nano Banana :
```
AI pipeline visualization for microalgae analysis, crop image from microscope, segmentation mask overlay with SAM2, classification result with ResNet50 probabilities for Karenia Alexandrium Others, clean scientific dashboard style, high resolution, 16:9, no text
```

Discours :
Apres la detection, SAM2 peut produire un masque de segmentation afin de mieux visualiser la zone de la cellule. Ensuite, ResNet50 classifie le crop. Le modele retourne des probabilites. Dans l'implementation, un seuil de confiance de 50 % est utilise : si la prediction n'est pas assez fiable, la classe finale devient `Autres`. Cette decision permet de reduire les classifications forcees et de signaler les cas qui demandent une verification.

---

## Slide 16 - Module IA 4 : evaluation, validation experte et apprentissage continu

Temps : 1 minute 30

Contenu ecran :
- Chaque crop possede un `crop_id`.
- L'expert confirme ou corrige la classe.
- API : `POST /validate/{crop_id}`.
- Le crop valide est copie dans :
  - dataset/Karenia
  - dataset/Alexandrium
  - dataset/Autres
- API : `GET /dataset/stats`.
- API : `POST /retrain`.

Image :
Boucle d'apprentissage : prediction -> correction -> dataset -> reentrainement.

Description image :
L'image montre l'amelioration continue : les corrections expertes deviennent des donnees d'entrainement.

Prompt Nano Banana :
```
Human in the loop AI learning cycle for microalgae classification, AI prediction, expert validation correction, validated dataset folders, model retraining, improved model, clean professional scientific infographic, blue green orange accents, 16:9, no text
```

Discours :
La qualite du systeme repose sur la validation experte. Chaque cellule detectee a un identifiant unique, ce qui permet de confirmer ou corriger precisement la prediction. Quand l'expert valide, le crop est range dans le dossier de la classe confirmee. Le dataset devient donc progressivement plus fiable. Ensuite, lorsque suffisamment d'images sont disponibles, le reentrainement peut etre lance. C'est la partie generative learning ou apprentissage continu : le systeme apprend a partir des corrections metier.

---

## Slide 17 - Fonctionnalites metier et interface

Temps : 1 minute 15

Contenu ecran :
Fonctionnalites :
- Dashboard.
- Gestion des projets.
- Import et galerie d'images.
- Analyse IA par selection d'images.
- Resultats avec classes, scores, bounding boxes/crops.
- Validation/correction.
- Analytics et alertes bloom.
- Notifications.
- Gestion des permissions.

Images/captures a inserer :
- Capture 1 : page connexion ou dashboard.
- Capture 2 : detail projet avec galerie.
- Capture 3 : resultats IA.
- Capture 4 : analytics.

Description image :
Les captures montrent le passage de la gestion du projet a l'analyse IA puis a la decision.

Prompt Nano Banana :
```
Professional web application screenshots mockup for AI microalgae analysis platform, dashboard, project gallery, AI detection results, expert validation panel, analytics charts and bloom alerts, clean modern UI, blue green scientific palette, high resolution, 16:9, no text
```

Discours :
L'interface est pensee autour du flux de travail de l'utilisateur. On commence par un tableau de bord et une liste de projets. Ensuite, l'utilisateur ouvre un projet, importe ou selectionne des images, lance l'analyse IA, consulte les resultats et peut les valider. Les analytics permettent d'avoir une vision globale : nombre de cellules, repartition par classe, pourcentage de Karenia et alertes bloom. Les permissions garantissent que chaque role accede uniquement aux actions autorisees.

---

## Slide 18 - Alertes bloom et aide a la decision

Temps : 1 minute

Contenu ecran :
- Calcul des pourcentages par espece.
- Detection d'un seuil critique de Karenia.
- Notification aux experts et administrateurs.
- Deduplication des alertes recentes.
- Objectif : decision rapide et traçable.

Image :
Dashboard analytics avec jauge orange d'alerte bloom.

Description image :
L'image montre comment les resultats IA sont transformes en indicateur de risque.

Prompt Nano Banana :
```
Scientific analytics dashboard for microalgae bloom alert, charts showing species distribution, Karenia percentage gauge crossing threshold, orange warning notification, clean professional web UI, high resolution, 16:9, no text
```

Discours :
L'application ne se limite pas a classifier les cellules. Elle transforme les resultats en indicateurs exploitables. Si le pourcentage de Karenia atteint un seuil, une alerte bloom est creee pour les experts et administrateurs. Le backend evite les doublons d'alertes recentes. Cette fonctionnalite apporte une aide a la decision rapide, tout en gardant un historique traçable.

---

## Slide 19 - Outils et technologies utilisees

Temps : 1 minute

Contenu ecran :
Frontend :
- Vue 3, TypeScript, Vite, Pinia, Vue Router, Axios, ApexCharts

Backend :
- NestJS, Prisma, PostgreSQL, Swagger, JWT, Supabase Auth

IA :
- FastAPI, PyTorch, Torchvision, Ultralytics YOLO, OpenCV, PIL, NumPy, SAM2, ResNet50

DevOps :
- Docker Compose, Kong Gateway

Image :
Stack technique en couches.

Description image :
Cette image donne au jury une vision rapide des choix techniques et de leur role.

Prompt Nano Banana :
```
Layered technology stack diagram for AI web application, frontend Vue TypeScript, backend NestJS Prisma, database PostgreSQL Supabase, AI FastAPI PyTorch YOLO SAM2 ResNet OpenCV, DevOps Docker Kong, clean professional academic style, 16:9, no text
```

Discours :
La stack technique a ete choisie pour separer clairement les responsabilites. Vue 3 assure une interface reactive. NestJS structure le backend avec une architecture modulaire. PostgreSQL conserve les donnees. FastAPI est adapte a l'exposition du pipeline IA en Python. PyTorch, YOLO, SAM2 et ResNet50 couvrent la detection, la segmentation et la classification. Docker Compose facilite l'execution multi-services.

---

## Slide 20 - Resultats, apports et perspectives

Temps : 1 minute 30

Contenu ecran :
Resultats :
- Application web fonctionnelle.
- Gestion complete des projets, utilisateurs et permissions.
- Pipeline IA integre : YOLO -> SAM2 -> ResNet50.
- Validation experte et dataset enrichi.
- Analytics, notifications et alertes bloom.

Perspectives :
- Ameliorer le dataset avec plus d'images validees.
- Ajouter des metriques d'evaluation detaillees : precision, rappel, F1-score.
- Optimiser le temps d'inference.
- Ajouter un suivi temporel des blooms.
- Deployer sur serveur de production.

Image :
Avant/apres : processus manuel vs plateforme intelligente.

Description image :
Cette image conclut en montrant la valeur ajoutee : rapidite, organisation, traçabilite et amelioration continue.

Prompt Nano Banana :
```
Before and after comparison for scientific microalgae analysis, left manual microscope workflow, right intelligent AI web platform with detection validation analytics and alerts, clean premium academic presentation visual, blue green palette, high resolution, 16:9, no text
```

Discours :
En conclusion, ce PFE a permis de construire une application complete qui combine gestion metier, architecture web et intelligence artificielle. L'apport principal est l'integration d'une boucle complete : image, prediction, validation experte, dataset et reentrainement. Les perspectives concernent l'amelioration du dataset, l'evaluation plus precise des modeles et le deploiement dans un environnement de production.

---

# Slide supplementaire - Video de demonstration

Temps : 1 minute si le jury autorise une demo courte.

Scenario video :
1. Connexion.
2. Ouverture d'un projet.
3. Selection d'images.
4. Lancement de l'analyse IA.
5. Affichage des detections et classes.
6. Correction/validation d'un crop.
7. Consultation analytics et notification.

Description :
Cette video doit etre courte, sans son ou avec commentaire oral, et montrer uniquement le flux principal.

Prompt Nano Banana pour miniature video :
```
Professional thumbnail for demo video of AI microalgae analysis web application, laptop screen showing scientific dashboard with microscope images, detection boxes, validation panel and analytics charts, clean lab background, premium academic style, 16:9, no text
```

Discours :
Pour completer la presentation, je peux montrer une courte demonstration. Elle suit le parcours principal : connexion, ouverture d'un projet, lancement de l'analyse, visualisation des resultats, validation experte et consultation des statistiques. Cela permet de relier directement l'architecture technique a l'utilisation reelle.

---

# Repartition du temps conseillee

- Slides 1 a 5 : contexte, probleme, objectifs - 5 minutes.
- Slides 6 a 11 : methode, analyse et architecture - 6 minutes.
- Slides 12 a 16 : module IA et CRISP-DM - 6 minutes.
- Slides 17 a 20 : interface, alertes, technologies, conclusion - 3 minutes.

Total : 20 minutes.

---

# Questions probables du jury et reponses courtes

Question : Pourquoi avoir garde la validation experte si l'application utilise l'IA ?
Reponse : Parce que le domaine est sensible. L'IA accelere l'analyse, mais l'expert garantit la qualite scientifique. Les corrections expertes servent ensuite a ameliorer le dataset.

Question : Pourquoi YOLO et ResNet50 ?
Reponse : YOLO est adapte a la detection d'objets dans une image contenant plusieurs cellules. ResNet50 est robuste pour classifier des crops d'images. Leur combinaison separe la localisation et la classification.

Question : Pourquoi FastAPI pour l'IA ?
Reponse : FastAPI est leger, rapide et tres adapte aux services Python de machine learning. Il permet d'exposer facilement les endpoints de prediction, validation, statistiques et reentrainement.

Question : Comment eviter les mauvaises predictions ?
Reponse : Par le score de confiance, la classe `Autres` lorsque la confiance est faible, et la validation obligatoire par l'expert avant d'enrichir le dataset.

Question : Quelle est la valeur ajoutee de l'application ?
Reponse : Elle centralise les projets et images, automatise une grande partie de l'analyse, conserve la traçabilite des annotations et cree une boucle d'amelioration continue du modele IA.

