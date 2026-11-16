@echo off
title Tik Tov: Israel 3D - Game Launcher
color 0A
echo ========================================================
echo    TIK TOV: ISRAEL ECONOMIC GEOGRAPHY (3D)
echo ========================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js was not found on your PC.
    echo Please install Node.js LTS from https://nodejs.org and double-click this file again.
    pause
    exit /b
)

if not exist "node_modules" (
    echo [1/2] Installing 3D game libraries (first time only, ~30 seconds)...
    call npm install
)

echo [2/2] Launching Tik Tov Israel 3D in your browser...
call npm run dev
pause
