@echo off
echo ==========================================
echo MISE A JOUR DES CATEGORIES ET PRODUITS
echo ==========================================
echo.
echo Ce script va restructurer vos categories et ajouter toutes les epices...
echo.
call npx tsx scripts/seed-epices-categories.ts
echo.
echo Termine ! Verifiez votre site.
pause
