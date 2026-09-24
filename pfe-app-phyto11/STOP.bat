@echo off
setlocal
cd /d %~dp0
TITLE Phyto-App : Arret du projet

echo ========================================================
echo   ARRET DU PROJET
echo ========================================================
echo.

echo [1/2] Detection de la commande Compose...
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

echo [2/2] Arret de tous les services...
%COMPOSE_CMD% --profile dev down

echo.
echo ========================================================
echo   APPLICATION ARRETEE AVEC SUCCES !
echo ========================================================
echo.
pause