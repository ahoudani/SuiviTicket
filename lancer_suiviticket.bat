@echo off
cd /d "C:\Dev_Git\SuiviTicket"
node app.js
timeout /t 5 /nobreak >nul
start chrome "http://localhost:3000/"