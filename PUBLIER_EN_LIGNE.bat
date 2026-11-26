@echo off
chcp 65001 >nul
title Publication du Portfolio - Jean-Marc CODJO
cd /d "%~dp0"

set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT_EXE%" set "GIT_EXE=git"

echo ========================================================
echo   MISE A JOUR EN LIGNE DU PORTFOLIO JEAN-MARC CODJO
echo ========================================================
echo.

"%GIT_EXE%" status --short
echo.

"%GIT_EXE%" add -A
"%GIT_EXE%" diff --cached --quiet
if %errorlevel%==0 (
    echo Aucune nouvelle modification locale a envoyer.
    echo Verification de la synchronisation avec GitHub...
    "%GIT_EXE%" push -u origin main
    goto :done
)

for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set "TODAY=%%a-%%b-%%c"
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set "NOW=%%a%%b"

echo Enregistrement et envoi des modifications vers GitHub...
"%GIT_EXE%" commit -m "Mise a jour du portfolio (%TODAY% %NOW%)"
if %errorlevel% neq 0 (
    echo [ERREUR] Impossible de creer le commit.
    pause
    exit /b 1
)

"%GIT_EXE%" push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Si une fenetre GitHub s'est ouverte, connectez-vous puis relancez ce fichier.
    pause
    exit /b 1
)

:done
echo.
echo ========================================================
echo   TERMINE ! Votre site se met a jour automatiquement :
echo   https://portfolio-jean-marc-codjo.vercel.app
echo   (Patientez ~10 secondes puis rafraichissez la page)
echo ========================================================
echo.
pause
