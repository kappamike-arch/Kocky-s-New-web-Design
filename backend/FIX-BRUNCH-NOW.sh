#!/bin/bash

echo "🍳 KOCKY'S BRUNCH SYNC FIX"
echo "=========================="
echo "Frontend: http://72.167.227.205:3003/"
echo "Admin Panel: http://72.167.227.205:4000/"
echo "API Backend: http://72.167.227.205:5001/"
echo "=========================="
echo ""

# Navigate to backend directory
cd /home/stagingkockys/public_html/current/backend

# Run the test and fix script
echo "🔧 Running brunch sync fix..."
node test-and-fix.js

echo ""
echo "🔄 Restarting backend server..."
pm2 restart kockys-backend

echo ""
echo "⏳ Waiting for server restart..."
sleep 3

echo ""
echo "✅ Fix completed!"
echo "=========================="
echo "📋 Check these URLs:"
echo "   Admin Panel: http://72.167.227.205:4000/menu-management?type=BRUNCH"
echo "   Frontend: http://72.167.227.205:3003/brunch"
echo "=========================="



