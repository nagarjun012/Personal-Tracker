@echo off
title Starting Aura Life OS Production...
echo ==========================================
echo    STARTING AURA LIFE OS (PRODUCTION)
echo ==========================================
echo Opening http://localhost:3000 in browser...
timeout /t 2 >nul
start http://localhost:3000
npm start
