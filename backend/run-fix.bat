@echo off
echo Starting brunch sync fix...

echo Step 1: Running brunch seed script...
npx ts-node src/seed-brunch-items.ts

echo Step 2: Restarting backend server...
pm2 restart kockys-backend

echo Step 3: Waiting for server to start...
timeout /t 5 /nobreak

echo Step 4: Testing API endpoint...
curl -s http://72.167.227.205:5001/api/menu/brunch

echo.
echo Fix completed! Check the admin panel now.
pause



