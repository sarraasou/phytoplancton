# APPLICATION PFE PHYTO 2025
## Systeme Intelligent d'Analyse de Donnees de Cytometrie en Flux
## Detection automatique de Karenia Selliformis

---

## DESCRIPTION DU PROJET

Application web intelligente permettant :
- La detection automatique de microalgues (Karenia Selliformis)
- L'annotation et validation des images de cytometrie en flux
- La classification automatique par intelligence artificielle
- La gestion de projets et d'images pour biologistes et experts

---

## ETAPE 1 - INSTALLATION (une seule fois)

Installer Docker Desktop :
1. Aller sur : https://www.docker.com/products/docker-desktop
2. Telecharger et installer
3. Redemarrer le PC
4. Verifier que Docker Desktop est lance
   (icone baleine dans la barre des taches en bas a droite)

---

## ETAPE 2 - PREMIERE UTILISATION

Double-cliquer sur : LANCER_REBUILD.bat
- Duree : 5 a 15 minutes (telechargement des images Docker)
- Le navigateur s'ouvre automatiquement a la fin
- A faire UNE SEULE FOIS

---

## ETAPE 3 - UTILISATION QUOTIDIENNE

Double-cliquer sur : LANCER.bat
- Duree : 30 secondes
- Le navigateur s'ouvre automatiquement
- A utiliser chaque jour

---

## ETAPE 4 - ARRETER L'APPLICATION

Double-cliquer sur : STOP.bat
- Arrete proprement tous les services

---

## ACCES A L'APPLICATION

Site web          : http://localhost:3001
API Documentation : http://localhost:3005/api
IA Documentation  : http://localhost:8001/docs
Base de donnees   : http://localhost:53603
Logs              : http://localhost:8444

---

## ROLES UTILISATEURS

Administrateur
  Gestion des utilisateurs, roles et supervision globale

Expert / Biologiste
  Annotation, validation, ajout de nouvelles especes,
  supervision IA et correction des resultats

Utilisateur classique
  Telechargement d'images, creation de projets,
  annotation et consultation des resultats

---

## MODELES D'INTELLIGENCE ARTIFICIELLE

Detection (YOLOv8-medium)
  Precision : 94%
  Rappel    : 91%
  Detection en temps reel par bounding boxes

Classification (ResNet-50)
  Precision globale : 93%
  Karenia Selliformis : Precision 90% / Rappel 96%
  Autres cellules     : Precision 96% / Rappel 90%

---

## BASE DE DONNEES (pgAdmin)

URL      : http://localhost:53603
Email    : admin@example.com
Password : postgres

Connexion serveur :
Host     : db
Port     : 5432
Username : postgres
Password : postgres

---

## PROBLEMES FREQUENTS

Docker n'est pas demarre
  Ouvrir Docker Desktop et attendre que l'icone soit stable

Le site ne s'ouvre pas
  Attendre 2-3 minutes et rafraichir http://localhost:3001

Erreur de port deja utilise
  Lancer STOP.bat puis relancer LANCER.bat

Premiere utilisation lente
  Normal ! Docker telecharge les images (5-15 min)
  La prochaine fois sera rapide (30 sec)

---

## CONTACT SUPPORT

Email : dev.factory.app@gmail.com

