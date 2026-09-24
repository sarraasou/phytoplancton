@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0
TITLE Phyto-App : Reconstruction Docker

set USER_ID=1000
set GROUP_ID=1000

echo ========================================================
echo   RECONSTRUCTION COMPLETE - Detection Microalgues
echo ========================================================
echo.
echo ATTENTION : Cette operation peut durer 5 a 15 minutes.
echo Elle est necessaire uniquement apres modification de :
echo   - Dockerfile
echo   - requirements.txt / package.json
echo   - fichiers de configuration de build
echo.

REM ── Verification du fichier .env ──
if not exist ".env" (
    echo ERREUR : Fichier .env introuvable.
    echo Copiez .env.demo en .env et remplissez les variables sensibles.
    pause
    exit /b 1
)

echo [1/4] Verification Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Docker Desktop n'est pas demarre.
    echo Lancez Docker Desktop et attendez qu'il soit pret.
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
echo    Compose detecte : !COMPOSE_CMD!

echo [3/4] Arret et suppression des conteneurs existants...
%COMPOSE_CMD% --profile dev down

echo [4/4] Build complet + lancement (patientez)...
echo.
%COMPOSE_CMD% --profile dev up --build -d

if %errorlevel% neq 0 (
    echo.
    echo ERREUR : La reconstruction a echoue.
    echo.
    echo Consultez les logs avec :
    echo   docker compose --profile dev logs --tail=100
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   RECONSTRUCTION TERMINEE
echo.
echo   Frontend      : http://localhost:3001
echo   API (Swagger) : http://localhost:3005/api
echo   IA (FastAPI)  : http://localhost:8001/docs
echo   Kong (API GW) : http://localhost:8015
echo   DB Admin      : http://localhost:53603
echo   Logs (Dozzle) : http://localhost:8444
echo ========================================================
echo.
pause