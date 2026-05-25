@echo off
echo ==========================================
echo ENVOI DE TOUTES LES MISES A JOUR VERS VERCEL
echo ==========================================
git add .
git commit -m "fix: corriger l'erreur de syntaxe dans la page d'accueil"
git push
echo ==========================================
echo TERMINE ! Vercel est en train de se mettre a jour.
echo Allez sur Vercel, attendez que le deploiment finisse (1 a 2 minutes), puis rechargez votre site.
pause
