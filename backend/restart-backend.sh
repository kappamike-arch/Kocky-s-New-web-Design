#!/bin/bash

echo "🔄 Restarting Kocky's backend server..."

# Kill any existing PM2 processes
pm2 delete kockys-backend 2>/dev/null || true

# Start the backend server
cd /home/stagingkockys/public_html/current/backend
pm2 start ecosystem.config.js --only kockys-backend

echo "✅ Backend server restarted!"
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🧪 Testing API endpoint..."
sleep 3
curl -s http://72.167.227.205:5001/api/menu/brunch | jq . || echo "API test failed - server may still be starting"



