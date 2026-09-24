@echo off
setlocal
cd /d %~dp0
TITLE Phyto-App : Systeme de Detection de Microalgues

echo ========================================================
echo   LANCEMENT RAPIDE DU PROJET (DOCKER MODE)
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
        echo Mettez a jour Docker Desktop pour inclure Compose.
        pause
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
)

echo [3/4] Arret des anciens conteneurs (si besoin)...
%COMPOSE_CMD% --profile dev down >nul 2>&1

echo [4/4] Lancement des services (sans rebuild)...
echo.
%COMPOSE_CMD% --profile dev up -d

if %errorlevel% neq 0 (
    echo.
    echo ERREUR : Le lancement a echoue. Verifiez les logs ci-dessus.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   LE PROJET EST PRET !
echo ========================================================
echo.
echo   Frontend      : http://localhost:3001
echo   API (Swagger) : http://localhost:3005/api
echo   IA (FastAPI)  : http://localhost:8001/docs
echo   Base donnees  : http://localhost:53603
echo   Logs          : http://localhost:8444
echo ========================================================
echo.
echo Astuce : si vous modifiez les dependances,
echo          lancez LANCER_REBUILD.bat a la place.
echo.

REM Ouvre automatiquement le navigateur
start http://localhost:3001

pause