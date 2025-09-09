#!/bin/bash

echo "🍳 KOCKY'S BRUNCH SYNC FIX - CPANEL VERSION"
echo "============================================="
echo "Using cPanel access to fix brunch syncing..."
echo ""

# Check if we're in the right directory
if [ ! -f "test-and-fix.js" ]; then
    echo "❌ test-and-fix.js not found!"
    echo "Current directory: $(pwd)"
    echo "Available files:"
    ls -la *.js 2>/dev/null || echo "No .js files found"
    exit 1
fi

echo "✅ Found test-and-fix.js in current directory"
echo "📍 Current directory: $(pwd)"
echo ""

# Check Node.js
echo "🔍 Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node -v)"
else
    echo "❌ Node.js not found!"
    echo "Please install Node.js or contact your hosting provider"
    exit 1
fi

# Check PM2
echo "🔍 Checking PM2..."
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 version: $(pm2 -v)"
else
    echo "⚠️ PM2 not found - will try to restart manually"
fi

# Run the fix script
echo ""
echo "🔧 Running brunch sync fix..."
node test-and-fix.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo "✅ Fix script completed successfully!"
else
    echo "❌ Fix script failed!"
    exit 1
fi

# Try to restart backend server
echo ""
echo "🔄 Attempting to restart backend server..."
if command -v pm2 &> /dev/null; then
    pm2 restart kockys-backend
    echo "✅ PM2 restart command sent"
else
    echo "⚠️ PM2 not available - you may need to restart manually"
    echo "   Check your hosting provider's process management"
fi

# Wait a moment
echo "⏳ Waiting for server restart..."
sleep 3

# Test the API endpoint
echo ""
echo "🧪 Testing API endpoint..."
echo "Testing: http://api.staging.kockys.com/menu/brunch"
curl -s http://api.staging.kockys.com/menu/brunch | head -c 200
echo ""

# Also test the direct IP
echo "Testing: http://72.167.227.205:5001/api/menu/brunch"
curl -s http://72.167.227.205:5001/api/menu/brunch | head -c 200
echo ""

echo ""
echo "✅ cPanel fix completed!"
echo "============================================="
echo "📋 Check these URLs:"
echo "   Admin Panel: http://staging.kockys.com:4000/menu-management?type=BRUNCH"
echo "   Frontend: http://staging.kockys.com:3003/brunch"
echo "   API (Domain): http://api.staging.kockys.com/menu/brunch"
echo "   API (Direct): http://72.167.227.205:5001/api/menu/brunch"
echo "============================================="



