@echo off
title Starting Aura Life OS...
echo ==========================================
echo       STARTING AURA LIFE OS
echo ==========================================
echo Opening http://localhost:5173 in browser...
timeout /t 2 >nul
start http://localhost:5173
npm run dev
