@echo off
title DAILY TRACKER Launcher
echo ==========================================
echo       STARTING DAILY TRACKER
echo ==========================================
echo Launching browser...
start "" "http://localhost:5173"
echo.
echo Starting Vite server... (Do not close this window)
echo ==========================================
call npx.cmd vite
