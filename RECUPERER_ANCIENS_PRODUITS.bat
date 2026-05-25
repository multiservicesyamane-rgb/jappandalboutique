@echo off
echo ==========================================
echo MIGRATION DES ANCIENS PRODUITS...
echo ==========================================
npx tsx scripts/seed-epices-categories.ts
echo ==========================================
echo TERMINE !
pause
