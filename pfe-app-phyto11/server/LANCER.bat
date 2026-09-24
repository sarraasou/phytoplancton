@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0
TITLE Phyto-App : Systeme de Detection de Microalgues

echo ========================================================
echo   LANCEMENT RAPIDE - Systeme Detection Microalgues
echo ========================================================
echo.

REM ── Variables USER_ID/GROUP_ID requises par migrate-dev sous Windows ──
set USER_ID=1000
set GROUP_ID=1000

REM ── Verification du fichier .env ──
if not exist ".env" (
    echo ERREUR : Fichier .env introuvable.
    echo Copiez .env.demo en .env et remplissez les variables sensibles.
    echo Exemple : copy .env.demo .env
    pause
    exit /b 1
)

echo [1/5] Verification de Docker installe...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Docker n'est pas installe.
    echo Telechargez Docker Desktop sur https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [2/5] Verification que Docker Desktop est demarre...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Docker Desktop n'est pas demarre.
    echo Lancez Docker Desktop, attendez l'icone verte, puis relancez.
    pause
    exit /b 1
)

echo [3/5] Detection de la commande Compose...
set "COMPOSE_CMD=docker compose"
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERREUR : Docker Compose introuvable.
        echo Mettez a jour Docker Desktop (version recente inclut Compose V2).
        pause
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
)
echo    Compose detecte : !COMPOSE_CMD!

echo [4/5] Arret des anciens conteneurs...
%COMPOSE_CMD% --profile dev down >nul 2>&1

echo [5/5] Lancement des services (mode dev)...
echo    Patientez, le premier demarrage peut prendre quelques minutes...
echo.
%COMPOSE_CMD% --profile dev up -d

if %errorlevel% neq 0 (
    echo.
    echo ERREUR : Le lancement a echoue.
    echo.
    echo Consultez les logs avec :
    echo   docker compose --profile dev logs --tail=50
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   PROJET DEMARRE AVEC SUCCES
echo.
echo   Frontend      : http://localhost:3001
echo   API (Swagger) : http://localhost:3005/api
echo   IA (FastAPI)  : http://localhost:8001/docs
echo   Kong (API GW) : http://localhost:8015
echo   DB Admin      : http://localhost:53603
echo   Logs (Dozzle) : http://localhost:8444
echo ========================================================
echo.
echo Astuce : Pour voir les logs en direct, ouvrez http://localhost:8444
echo Astuce : Pour rebuilder apres modif, lancez LANCER_REBUILD.bat
echo.
pause