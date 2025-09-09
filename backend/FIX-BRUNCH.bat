@echo off
echo ========================================
echo    KOCKY'S BRUNCH SYNC FIX
echo ========================================
echo.

echo Step 1: Adding brunch items to database...
node quick-fix.js

echo.
echo Step 2: Restarting backend server...
pm2 restart kockys-backend

echo.
echo Step 3: Waiting for server restart...
timeout /t 5 /nobreak >nul

echo.
echo Step 4: Testing API...
curl -s http://72.167.227.205:5001/api/menu/brunch

echo.
echo ========================================
echo    FIX COMPLETED!
echo ========================================
echo.
echo Now check:
echo - Admin Panel: http://72.167.227.205:4000/menu-management?type=BRUNCH
echo - Frontend: http://72.167.227.205:3003/brunch
echo.
pause



