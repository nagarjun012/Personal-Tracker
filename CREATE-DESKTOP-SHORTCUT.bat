@echo off
title DAILY TRACKER - Create Desktop Shortcut
cd /d "%~dp0"

echo =======================================================
echo          DAILY TRACKER - SHORTCUT CREATOR
echo =======================================================
echo.
echo Creating Desktop Shortcut for DAILY TRACKER...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $shortcutPath = [System.IO.Path]::Combine($desktop, 'DAILY TRACKER.lnk'); $s = $ws.CreateShortcut($shortcutPath); $s.TargetPath = '%~dp0RUN-APP.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'DAILY TRACKER - Personal Life & Productivity System'; $s.Save(); Write-Host 'Shortcut created at: ' $shortcutPath"

echo.
echo =======================================================
echo   [SUCCESS] Shortcut created on your Desktop!
echo   You can now launch DAILY TRACKER with one click!
echo =======================================================
echo.
pause
