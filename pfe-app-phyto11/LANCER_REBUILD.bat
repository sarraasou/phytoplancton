@echo off
setlocal
cd /d %~dp0
TITLE Phyto-App : Reconstruction Docker

echo ========================================================
echo   RECONSTRUCTION COMPLETE DU PROJET (DOCKER MODE)
echo   ATTENTION : Peut prendre 5 a 15 minutes !
echo ========================================================
echo.

echo [1/4] Verification de Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Docker n'est pas installe ou n'est pas lance.
    echo Installez Docker Desktop puis relancez ce script.
    echo Telechargement : https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [2/4] Detection de la commande Compose...
set "COMPOSE_CMD=docker compose"
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERREUR : Docker Compose introuvable.
        pause
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
)

echo [3/4] Arret des conteneurs existants...
%COMPOSE_CMD% --profile dev down

echo [4/4] Build complet + lancement...
echo (Telechargement des images et compilation en cours...)
echo.
%COMPOSE_CMD% --profile dev up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ERREUR : La reconstruction a echoue.
    echo Verifiez votre connexion internet et les logs ci-dessus.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   RECONSTRUCTION TERMINEE ! PROJET PRET !
echo ========================================================
echo.
echo   Frontend      : http://localhost:3001
echo   API (Swagger) : http://localhost:3005/api
echo   IA (FastAPI)  : http://localhost:8001/docs
echo   Base donnees  : http://localhost:53603
echo   Logs          : http://localhost:8444
echo ========================================================
echo.
echo La prochaine fois, utilisez LANCER.bat (plus rapide).
echo.

REM Ouvre automatiquement le navigateur
start http://localhost:3001

pause