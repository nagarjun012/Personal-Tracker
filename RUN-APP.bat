@echo off
title Aura Life OS Launcher
echo ==========================================
echo       STARTING AURA LIFE OS
echo ==========================================
echo Launching browser...
start "" "http://localhost:5173"
echo.
echo Starting Vite server... (Do not close this window)
echo ==========================================
call npx.cmd vite
