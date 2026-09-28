@echo off
setlocal enabledelayedexpansion
title DAILY TRACKER - Full Stack Launcher
cd /d "%~dp0"

cls
echo =======================================================
echo     DAILY TRACKER - FULL STACK (SQLITE + FRONTEND)
echo =======================================================
echo.
echo [1/2] Checking system environment...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js from https://nodejs.org/ to run the app.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo.
    echo [INFO] First time setup detected. Installing packages...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Package installation failed. Please check your internet connection.
        echo.
        pause
        exit /b 1
    )
)

echo [2/2] Starting SQLite server and Vite dev frontend...
echo.
echo =======================================================
echo   * Backend: http://localhost:3000
echo   * Frontend: http://localhost:5173
echo   * Browser will open automatically once ready
echo   * Press Ctrl+C in this window anytime to stop
echo =======================================================
echo.

call npm.cmd run dev
