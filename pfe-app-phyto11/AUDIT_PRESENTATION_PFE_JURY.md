# Audit de la presentation PFE AlgaeVision

Fichier analyse : `C:\Users\MSI\Downloads\presentation pfe [Autosaved].pptx (1).pptx`

Verdict rapide : la presentation a une bonne base visuelle et contient beaucoup d'elements techniques, mais elle n'est pas encore assez professionnelle pour une soutenance finale. Elle doit etre corrigee, reduite et harmonisee.

## 1. Est-ce que la presentation est professionnelle ?

Reponse : partiellement.

Points positifs :
- La presentation contient les grandes parties attendues : contexte, IA, developpement web, DevOps, demo, conclusion.
- Il y a beaucoup d'images et de schemas, ce qui est bien pour une soutenance.
- La partie IA est riche : dataset, augmentation, YOLO, SAM, ResNet, evaluation.
- La partie web existe : frontend, backend, architecture physique, interfaces.
- La partie DevOps existe : Docker, pipeline CI/CD.

Points qui rendent la presentation moins professionnelle :
- Elle contient 57 slides, ce qui est trop pour 20 minutes.
- Plusieurs slides sont des slides de sommaire repetees.
- Certaines phrases viennent d'un ancien projet de captioning : "generation des descriptions textuelles a partir des images", "modele de captioning". Il faut les supprimer.
- Il y a des incoherences techniques : Flask vs FastAPI, SAM2 vs SAM3, ResNet18 vs ResNet50, Scrumban vs Waterfall.
- Il y a beaucoup de fautes visibles : "Alexendruim", "Surveilance", "cotières", "permisioner", "statictisc", "base de donner".
- Les titres ne sont pas toujours homogenes : parfois "Classification des images", parfois "Developpement du modele IA", parfois "generation des descriptions".
- Il manque une vraie slide claire sur la problematique et une slide claire sur les objectifs.
- Il manque une slide de synthese des contributions.
- Il manque une slide de limites du projet.

Conclusion :
La presentation peut devenir professionnelle, mais il faut la transformer en une version plus courte, plus coherente et plus propre.

## 2. Corrections prioritaires

### Correction 1 : reduire le nombre de slides

Pour 20 minutes, il faut viser 22 a 28 slides maximum.

Structure recommandee :
1. Titre
2. Plan
3. Organisme d'accueil
4. Contexte general
5. Analyse de l'existant
6. Problematique
7. Objectifs du projet
8. Methodologie globale
9. Methodologie IA CRISP-DM
10. Dataset
11. Data augmentation
12. Pipeline IA global
13. Detection YOLO
14. Segmentation SAM
15. Classification ResNet
16. Evaluation des modeles
17. Architecture logique
18. Architecture physique Docker
19. Frontend
20. Backend
21. DevOps et CI/CD
22. Interfaces principales
23. Demo
24. Resultats et apports
25. Limites
26. Perspectives
27. Conclusion
28. Merci

### Correction 2 : supprimer les elements hors sujet

Supprimer toutes les mentions suivantes :
- generation des descriptions textuelles
- captioning
- descriptions textuelles pertinentes
- modele de captioning

Ces termes donnent l'impression que la presentation vient d'un autre projet.

### Correction 3 : uniformiser le sujet

Titre recommande :

Developpement d'une application intelligente pour la detection, la classification et le suivi des microalgues toxiques

Sous-titre :

Application web AlgaeVision : IA, validation experte, analytics et alertes bloom

### Correction 4 : corriger les noms scientifiques et mots visibles

Corrections :
- Alexendruim -> Alexandrium
- Karenia Alexendruim -> Karenia / Alexandrium
- Surveilance -> Surveillance
- cotières -> cotieres
- intelligent -> intelligente
- bloomet -> bloom et
- List de projet -> Liste des projets
- permisioner -> permissionnes
- statictisc -> statistiques
- base de donner -> base de donnees
- Sam -> SAM
- ResNet -> ResNet
- Docker&Monitoring -> Docker & Monitoring

### Correction 5 : clarifier la methodologie

Il faut choisir une ligne claire.

Option recommandee devant jury :
- Methodologie globale projet : Waterfall ou Scrumban, mais pas les deux sans explication.
- Methodologie IA : CRISP-DM.

Si tu veux garder Scrumban :
Dire : "Pour le developpement logiciel, nous avons utilise Scrumban afin de gerer les taches de maniere flexible. Pour la partie IA, nous avons applique CRISP-DM."

Si ton rapport dit Waterfall :
Dire : "Pour la conduite globale, nous avons suivi une demarche sequentielle de type Waterfall. Pour l'IA, nous avons suivi CRISP-DM."

Ne melange pas Waterfall et Scrumban dans la meme presentation sans justification.

### Correction 6 : verifier les technologies reelles

D'apres le code du projet :
- API IA : FastAPI, pas Flask.
- Le pipeline code : YOLO -> SAM2 -> ResNet.
- Le fichier `ai-api/main.py` indique `RESNET_MODEL_CHOICE = "resnet50"`.
- Les endpoints IA sont : `/predict_from_urls`, `/validate/{crop_id}`, `/dataset/stats`, `/retrain`.
- Backend : NestJS + Prisma + PostgreSQL.
- Frontend : Vue 3 + TypeScript + Vite.
- DevOps : Docker Compose + GitLab CI/CD + Kong.

Donc dans la presentation, eviter de dire "serveur Flask" si ton code actuel utilise FastAPI.

## 3. Ce qui manque dans la presentation

### A. Slide problematique claire

Contenu propose :

Problematique :
Comment automatiser l'analyse des images de microalgues tout en conservant la fiabilite scientifique grace a la validation experte ?

Points :
- Analyse manuelle lente.
- Especes proches difficiles a distinguer.
- Risque d'erreurs inter-observateurs.
- Besoin d'un systeme centralise, traçable et evolutif.

### B. Slide objectifs claire

Objectifs :
- Developper une application web de gestion des projets d'analyse.
- Integrer un pipeline IA de detection, segmentation et classification.
- Permettre la validation/correction par un expert.
- Generer des statistiques et alertes bloom.
- Conteneuriser l'application avec Docker.
- Automatiser le cycle test/build/deploiement avec GitLab CI/CD.

### C. Slide contributions

Contributions principales :
- Pipeline IA complet YOLO/SAM/ResNet.
- Plateforme web frontend/backend.
- Gestion des permissions.
- Validation experte et enrichissement du dataset.
- Alertes bloom.
- Deploiement Docker + CI/CD.

### D. Slide limites

Limites :
- Dataset encore limite pour certaines classes.
- Performance dependante de la qualite des images.
- Besoin de validation experte pour les cas ambigus.
- Deploiement production a renforcer avec monitoring avance.

### E. Slide evaluation

Il faut montrer :
- mAP50 pour YOLO.
- Precision / recall / F1-score pour classification si disponible.
- Matrice de confusion si possible.
- Justification du choix final du modele.

Si tu n'as pas toutes les metriques, dire :
"L'evaluation actuelle se base principalement sur mAP50 pour la detection et sur la comparaison qualitative/quantitative des modeles. Une perspective est d'ajouter une evaluation plus complete avec precision, rappel, F1-score et matrice de confusion."

## 4. Pitch corrige pour 20 minutes

Bonjour,

Je vais vous presenter mon projet de fin d'etudes intitule : developpement d'une application intelligente pour la detection, la classification et le suivi des microalgues toxiques.

Ce projet s'inscrit dans le contexte de la surveillance environnementale et sanitaire des eaux cotieres. Certaines microalgues, comme Karenia et Alexandrium, peuvent provoquer des blooms algaux toxiques. Leur suivi est donc important pour la protection de l'environnement et de la sante publique.

Actuellement, l'analyse repose fortement sur l'observation microscopique et l'expertise humaine. Cette methode est fiable, mais elle peut etre lente, subjective et difficile lorsque les especes sont proches morphologiquement. D'ou la problematique suivante : comment automatiser l'analyse des images de microalgues tout en conservant la validation scientifique de l'expert ?

Pour repondre a cette problematique, j'ai developpe une application web nommee AlgaeVision. Elle permet de gerer des projets, importer des images, lancer une analyse IA, afficher les resultats, valider ou corriger les predictions, consulter les statistiques et generer des alertes bloom.

Sur le plan methodologique, la partie logiciel a ete conduite avec une demarche structuree de gestion de projet, tandis que la partie IA suit la methodologie CRISP-DM. Cette derniere permet de passer de la comprehension du besoin metier jusqu'au deploiement du modele.

Le module IA repose sur un pipeline en plusieurs etapes. D'abord, YOLO detecte les cellules dans les images. Ensuite, SAM permet la segmentation des zones detectees. Enfin, ResNet classifie les crops en Karenia, Alexandrium ou Autres. Chaque prediction est associee a un score de confiance.

L'un des points importants du projet est la validation experte. L'IA propose une prediction, mais l'expert peut la confirmer ou la corriger. Les corrections sont ensuite sauvegardees dans le dataset valide, ce qui permet d'ameliorer progressivement le modele.

Sur le plan applicatif, le frontend est developpe avec Vue 3, TypeScript et Vite. Le backend repose sur NestJS, Prisma et PostgreSQL. L'API IA est exposee avec FastAPI. L'application integre aussi une gestion des permissions, des notifications et des alertes bloom.

Pour le deploiement, l'application est conteneurisee avec Docker Compose. Les services frontend, backend, API IA, base PostgreSQL, Kong Gateway et Supabase Auth sont separes. Le projet contient aussi une configuration GitLab CI/CD pour automatiser les tests, la construction et le deploiement vers staging et production.

En conclusion, ce projet apporte une plateforme complete combinant intelligence artificielle, developpement web, validation experte et DevOps. Les perspectives concernent l'enrichissement du dataset, l'amelioration des metriques d'evaluation, l'optimisation du temps d'inference et le deploiement dans un environnement de production plus complet.

Merci pour votre attention.

## 5. Questions possibles du jury et reponses

### Questions sur le contexte

Q1. Pourquoi les microalgues sont-elles importantes ?

Reponse :
Les microalgues jouent un role important dans les ecosystemes aquatiques, mais certaines especes peuvent devenir toxiques lorsqu'elles proliferent. Leur suivi permet de detecter les blooms algaux et de reduire les risques environnementaux et sanitaires.

Q2. Pourquoi avoir choisi Karenia et Alexandrium ?

Reponse :
Ces especes sont importantes car elles peuvent etre associees a des phenomenes de blooms toxiques. Elles sont aussi difficiles a distinguer manuellement dans certaines conditions, ce qui justifie l'utilisation d'une aide intelligente.

Q3. Quel est le probleme de la methode manuelle ?

Reponse :
La methode manuelle demande du temps, depend de l'expertise de l'observateur et peut produire des resultats variables. Elle est aussi moins adaptee lorsqu'il faut analyser beaucoup d'images.

### Questions sur la problematique

Q4. Quelle est la problematique principale de votre PFE ?

Reponse :
La problematique est de concevoir une application capable d'automatiser l'analyse des images de microalgues tout en conservant la fiabilite scientifique grace a la validation experte.

Q5. Votre application remplace-t-elle l'expert ?

Reponse :
Non. L'application assiste l'expert. L'IA propose des detections et classifications, mais l'expert garde le controle final par la validation ou la correction des predictions.

### Questions sur la methodologie

Q6. Quelle methodologie avez-vous utilisee ?

Reponse :
Pour la conduite globale du projet, j'ai utilise une methodologie structuree de developpement logiciel. Pour la partie IA, j'ai utilise CRISP-DM, qui est adaptee aux projets data science.

Q7. Pourquoi CRISP-DM ?

Reponse :
CRISP-DM permet de structurer un projet IA en plusieurs phases : comprehension metier, comprehension des donnees, preparation des donnees, modelisation, evaluation et deploiement. Cela correspond bien au cycle de developpement du module IA.

Q8. Quelle est la difference entre la methodologie projet et CRISP-DM ?

Reponse :
La methodologie projet organise le developpement global de l'application. CRISP-DM organise uniquement la partie IA, depuis les donnees jusqu'au modele deploye.

### Questions sur les donnees

Q9. Quelle est la source du dataset ?

Reponse :
Le dataset est constitue d'images de microalgues obtenues a partir du processus d'analyse par cytometrie/microscopie dans le contexte du projet. Les images sont ensuite preparees et organisees par classes.

Q10. Quelles sont les classes utilisees ?

Reponse :
Les classes principales sont Karenia, Alexandrium et Autres. La classe Autres permet de gerer les cas non reconnus ou les predictions de faible confiance.

Q11. Pourquoi utiliser la data augmentation ?

Reponse :
La data augmentation augmente la diversite du dataset sans collecter immediatement de nouvelles images. Elle rend le modele plus robuste aux rotations, variations de luminosite, zooms ou changements de contraste.

Q12. Quelle methode d'augmentation est la meilleure ?

Reponse :
D'apres les resultats presentes, les transformations geometriques donnent de bons resultats, par exemple un mAP50 eleve pour YOLO. Elles sont aussi plus simples, controlables et moins risquees que des images synthetiques mal validees.

### Questions sur YOLO

Q13. Pourquoi utiliser YOLO ?

Reponse :
YOLO est adapte a la detection d'objets dans une image. Dans notre cas, une image peut contenir plusieurs cellules. YOLO permet donc de localiser chaque cellule sous forme de bounding box.

Q14. Que signifie mAP50 ?

Reponse :
mAP50 signifie mean Average Precision avec un seuil IoU de 50 %. C'est une metrique qui evalue la qualite des detections. Plus elle est elevee, meilleures sont les detections.

Q15. Pourquoi ne pas classifier directement toute l'image ?

Reponse :
Parce qu'une image peut contenir plusieurs cellules. Il est plus precis de detecter d'abord chaque cellule, puis de classifier chaque crop individuellement.

### Questions sur SAM

Q16. Pourquoi utiliser SAM/SAM2 ?

Reponse :
SAM permet de segmenter plus precisement la zone de la cellule detectee. Cela aide a visualiser la region analysee et peut ameliorer l'interpretation des resultats par l'expert.

Q17. La segmentation est-elle obligatoire ?

Reponse :
Non, elle peut etre consideree comme une etape d'enrichissement visuel. La detection et la classification peuvent fonctionner sans segmentation, mais le masque apporte une meilleure lisibilite.

### Questions sur ResNet

Q18. Pourquoi utiliser ResNet ?

Reponse :
ResNet est une architecture robuste pour la classification d'images. Elle permet de classifier les crops detectes en differentes classes de microalgues.

Q19. Pourquoi ResNet18 ou ResNet50 ?

Reponse :
ResNet18 est plus leger et rapide. ResNet50 est plus profond et peut apprendre des representations plus riches, mais demande plus de ressources. Le choix depend du compromis entre precision et performance.

Q20. Comment gerez-vous les predictions incertaines ?

Reponse :
Le systeme utilise un score de confiance. Si la confiance est faible, la prediction peut etre classee comme Autres ou envoyee en verification experte.

### Questions sur la validation experte

Q21. Pourquoi la validation experte est-elle importante ?

Reponse :
Parce que le domaine est sensible. Une mauvaise classification peut avoir des consequences sur l'interpretation scientifique. L'expert garantit la qualite finale.

Q22. Que devient une correction experte ?

Reponse :
La correction est enregistree avec le crop correspondant et alimente le dataset valide. Elle peut ensuite servir au reentrainement du modele.

Q23. Qu'est-ce que l'apprentissage continu dans votre projet ?

Reponse :
C'est le principe selon lequel les nouvelles corrections expertes enrichissent le dataset, ce qui permet d'ameliorer le modele lors d'un futur reentrainement.

### Questions sur le frontend

Q24. Quelles technologies utilisez-vous pour le frontend ?

Reponse :
Le frontend utilise Vue 3, TypeScript, Vite, Pinia, Vue Router, Axios et des bibliotheques de graphiques comme ApexCharts ou Chart.js.

Q25. Pourquoi Vue 3 ?

Reponse :
Vue 3 permet de construire une interface reactive, modulaire et maintenable. Il est adapte aux dashboards et applications web interactives.

Q26. Quelles sont les principales interfaces ?

Reponse :
Les interfaces principales sont l'authentification, le dashboard, la gestion des projets, l'import d'images, l'affichage des resultats IA, la validation experte, les statistiques, les notifications et les permissions.

### Questions sur le backend

Q27. Quelles technologies utilisez-vous pour le backend ?

Reponse :
Le backend utilise NestJS, Prisma et PostgreSQL. Il gere les utilisateurs, projets, images, annotations, permissions, notifications et configurations.

Q28. Pourquoi NestJS ?

Reponse :
NestJS fournit une architecture modulaire et structuree. Il est adapte aux applications professionnelles, avec controllers, services, modules et support de la securite.

Q29. Pourquoi Prisma ?

Reponse :
Prisma simplifie l'acces a la base de donnees, apporte un typage clair et facilite les operations CRUD sur PostgreSQL.

Q30. Comment gerez-vous les permissions ?

Reponse :
Le projet utilise des permissions par projet, comme canView, canUpload, canAnnotate, canValidate, canEdit et canDelete. Cela permet de controler precisement les actions de chaque utilisateur.

### Questions sur l'API IA

Q31. Pourquoi separer l'API IA du backend ?

Reponse :
La separation permet d'isoler les dependances Python et machine learning du backend NestJS. Cela rend l'architecture plus claire, plus maintenable et plus scalable.

Q32. Quels endpoints expose l'API IA ?

Reponse :
Les endpoints principaux sont `/predict_from_urls` pour la prediction, `/validate/{crop_id}` pour la validation, `/dataset/stats` pour les statistiques du dataset et `/retrain` pour le reentrainement.

Q33. Pourquoi FastAPI ?

Reponse :
FastAPI est rapide, leger et tres adapte aux APIs Python de machine learning. Il permet aussi de documenter facilement les endpoints.

### Questions sur Docker et DevOps

Q34. Pourquoi utiliser Docker ?

Reponse :
Docker permet d'isoler les services et leurs dependances. Cela rend l'environnement plus stable, reproductible et plus facile a deployer.

Q35. Quels services sont conteneurises ?

Reponse :
Le frontend Vue, le backend NestJS, l'API IA FastAPI, PostgreSQL, Kong Gateway et Supabase Auth/GoTrue.

Q36. Quel est le role de Docker Compose ?

Reponse :
Docker Compose permet de lancer plusieurs conteneurs ensemble avec une configuration centralisee. Il simplifie le demarrage de l'application complete.

Q37. Utilisez-vous CI/CD ?

Reponse :
Oui. Le projet contient un fichier `.gitlab-ci.yml` avec les stages test, build-push, deploy-web et deploy.

Q38. Quelle est la difference entre staging et production ?

Reponse :
Staging est l'environnement de validation avant mise en production. Production est l'environnement final stable. Dans le pipeline, la production est limitee a la branche main.

Q39. Quel est le role de Kong ?

Reponse :
Kong agit comme API Gateway. Il centralise l'acces aux services et peut gerer des aspects comme le routage, CORS, authentification ou securite.

### Questions sur les alertes bloom

Q40. Comment detectez-vous une alerte bloom ?

Reponse :
L'application calcule la proportion de certaines especes, notamment Karenia. Si un seuil critique est atteint, une notification d'alerte est creee pour les experts et administrateurs.

Q41. Pourquoi les alertes sont importantes ?

Reponse :
Elles transforment les resultats IA en information decisionnelle. L'expert peut reagir plus rapidement lorsqu'un risque est detecte.

### Questions sur les resultats

Q42. Quels sont les resultats principaux du projet ?

Reponse :
Les resultats sont une application web fonctionnelle, un pipeline IA integre, une gestion des projets et permissions, une validation experte, des analytics, des notifications, des alertes bloom et un deploiement Docker.

Q43. Quelle est la valeur ajoutee de votre application ?

Reponse :
Elle centralise le workflow complet : images, analyse IA, validation, statistiques, alertes et amelioration du dataset. Elle combine rapidite automatique et controle expert.

### Questions critiques

Q44. Que se passe-t-il si l'IA se trompe ?

Reponse :
L'expert peut corriger la prediction. La correction est sauvegardee et peut etre reutilisee pour ameliorer le modele. Le systeme ne prend donc pas une decision finale sans validation.

Q45. Votre modele est-il generalisable ?

Reponse :
Il est generalisable dans la limite des donnees d'entrainement disponibles. Pour ameliorer la generalisation, il faut enrichir le dataset avec plus d'images, de conditions d'acquisition et d'especes.

Q46. Quelles sont les limites de votre travail ?

Reponse :
Les limites principales sont la taille et la diversite du dataset, la dependance a la qualite des images, la necessite de validation experte et le besoin d'une evaluation plus complete pour la production.

Q47. Pourquoi ne pas utiliser un seul modele de bout en bout ?

Reponse :
Une architecture en pipeline est plus interpretable. YOLO localise, SAM segmente et ResNet classifie. Cela facilite le diagnostic des erreurs et la validation par l'expert.

Q48. Comment securisez-vous l'application ?

Reponse :
La securite repose sur l'authentification, les roles, les permissions par projet et la separation des services. Kong peut aussi contribuer a la securisation des acces API.

Q49. Qu'est-ce que vous avez appris dans ce projet ?

Reponse :
J'ai appris a integrer plusieurs domaines : developpement web, backend, base de donnees, intelligence artificielle, validation experte, Docker et CI/CD. Le plus important etait de transformer un modele IA en application metier utilisable.

Q50. Quelle serait la prochaine amelioration prioritaire ?

Reponse :
La priorite serait d'enrichir le dataset valide, d'ajouter une evaluation plus complete des modeles et de renforcer le monitoring en production.

## 6. Recommandation finale pour la soutenance

Ne presente pas tout. Le jury ne veut pas voir tous les details, il veut comprendre :
1. Le probleme.
2. Ta solution.
3. Comment tu l'as construite.
4. Pourquoi tes choix sont justifies.
5. Ce que l'application apporte.
6. Ce qui reste a ameliorer.

Phrase de conclusion forte :

Ce projet ne se limite pas a un modele IA. Il propose une plateforme complete qui relie l'analyse automatique, la validation experte, la gestion des donnees, les alertes et le deploiement professionnel.

