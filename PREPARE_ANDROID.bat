@echo off
title Tik Tov: Israel 3D - Android Studio Exporter
color 0B
echo ========================================================
echo    PREPARING ISRAEL 3D BUILD FOR ANDROID STUDIO
echo ========================================================
echo.

if not exist "node_modules" (
    call npm install
)

echo [1/3] Installing Capacitor Android Bridge...
call npm install @capacitor/core @capacitor/cli @capacitor/android

echo [2/3] Building 3D web bundle...
call npm run build

if not exist "android" (
    echo [3/3] Generating Android Studio project folder...
    call npx cap add android
) else (
    echo [3/3] Syncing updates to Android Studio folder...
    call npx cap sync android
)

echo.
echo ========================================================
echo DONE! Open Android Studio, click "Open", and select:
echo %~dp0android
echo ========================================================
pause
