#!/bin/bash

echo "🚀 Starting Kocky's Brunch Sync Fix..."
echo "========================================"

# Navigate to backend directory
cd /home/stagingkockys/public_html/current/backend

echo "📍 Current directory: $(pwd)"

# Run the quick fix script
echo "📝 Step 1: Adding brunch items to database..."
node quick-fix.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo "✅ Database seeding completed successfully!"
else
    echo "❌ Database seeding failed!"
    exit 1
fi

# Restart the backend server
echo "🔄 Step 2: Restarting backend server..."
pm2 restart kockys-backend

# Wait for server to restart
echo "⏳ Step 3: Waiting for server to restart..."
sleep 5

# Test the API endpoint
echo "🧪 Step 4: Testing API endpoint..."
curl -s http://72.167.227.205:5001/api/menu/brunch | jq . || echo "API test failed - server may still be starting"

echo ""
echo "🎉 Brunch sync fix completed!"
echo "========================================"
echo "📋 Check these URLs:"
echo "   Admin Panel: http://72.167.227.205:4000/menu-management?type=BRUNCH"
echo "   Frontend: http://72.167.227.205:3003/brunch"
echo "========================================"



