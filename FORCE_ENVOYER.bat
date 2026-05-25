@echo off
echo ==========================================
echo CORRECTION DE L'ERREUR DE SECURITE GITHUB
echo ==========================================
echo.
echo Ce script va nettoyer l'historique des commits locaux pour retirer
echo la cle secrete qui bloque l'envoi, puis tout envoyer sur Vercel.
echo.
git reset origin/main
git add .
git commit -m "fix: Suppression de la cle secrete et mise a jour de la top bar"
git push
echo.
echo ==========================================
echo TERMINE ! Vercel est en train de se mettre a jour.
echo Allez sur Vercel, attendez que le deploiment finisse, puis rechargez votre site.
pause
