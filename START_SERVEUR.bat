@echo off
echo Lancement du serveur local Jappandal Boutique...
echo Les logs sont ecris dans server_output.log. Ne fermez pas cette fenetre.
npm run dev > server_output.log 2>&1
pause
