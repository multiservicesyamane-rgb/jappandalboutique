@echo off
echo ==========================================
echo MISE A JOUR DES CATEGORIES ET PRODUITS
echo ==========================================
echo.
echo Ce script va restructurer vos categories et ajouter toutes les epices...
echo.
call npx tsx scripts/seed-epices-categories.ts > ajout_log.txt 2>&1
echo.
echo Termine ! Regardez le fichier ajout_log.txt pour voir s'il y a eu des erreurs.
pause
