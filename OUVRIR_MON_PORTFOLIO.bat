@echo off
title Apercu Local - Portfolio Jean-Marc CODJO
echo Lancement du serveur local sur http://127.0.0.1:8080/ ...
echo Fermez cette fenetre pour arreter le serveur.
start "" "http://127.0.0.1:8080/"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0lancer_serveur.ps1"
