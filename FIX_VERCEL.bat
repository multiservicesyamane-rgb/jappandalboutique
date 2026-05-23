@echo off
echo ==========================================
echo ENVOI DES MISES A JOUR VERS VERCEL...
echo ==========================================
git add server/db.ts
git commit -m "fix: ajout de prepare false pour supabase et affichage erreur"
git push
echo ==========================================
echo TERMINE ! Vercel est en train de se mettre a jour.
echo Allez sur Vercel, attendez que le deploiment finisse, puis rechargez votre site.
pause
