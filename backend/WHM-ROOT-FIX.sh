#!/bin/bash

echo "🍳 KOCKY'S BRUNCH SYNC FIX - WHM ROOT ACCESS"
echo "============================================="
echo "Running with WHM root access..."
echo ""

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run as root"
    echo "Please run: sudo $0"
    exit 1
fi

echo "✅ Running as root user"
echo ""

# Switch to the stagingkockys user and run the fix
echo "🔄 Switching to stagingkockys user..."
su - stagingkockys << 'EOF'
    echo "📍 Current user: $(whoami)"
    echo "📍 Home directory: $(pwd)"
    
    # Navigate to backend directory
    cd /home/stagingkockys/public_html/current/backend
    echo "📍 Backend directory: $(pwd)"
    
    # Check if files exist
    if [ ! -f "test-and-fix.js" ]; then
        echo "❌ test-and-fix.js not found!"
        echo "Available files:"
        ls -la *.js
        exit 1
    fi
    
    # Check if Node.js is available
    echo "🔍 Checking Node.js..."
    if command -v node &> /dev/null; then
        echo "✅ Node.js version: $(node -v)"
    else
        echo "❌ Node.js not found!"
        exit 1
    fi
    
    # Check if PM2 is available
    echo "🔍 Checking PM2..."
    if command -v pm2 &> /dev/null; then
        echo "✅ PM2 version: $(pm2 -v)"
    else
        echo "❌ PM2 not found!"
        exit 1
    fi
    
    # Run the fix script
    echo "🔧 Running brunch sync fix..."
    node test-and-fix.js
    
    # Check if the script ran successfully
    if [ $? -eq 0 ]; then
        echo "✅ Fix script completed successfully!"
    else
        echo "❌ Fix script failed!"
        exit 1
    fi
    
    # Restart backend server
    echo "🔄 Restarting backend server..."
    pm2 restart kockys-backend
    
    # Wait for restart
    echo "⏳ Waiting for server restart..."
    sleep 5
    
    # Check PM2 status
    echo "📊 PM2 Status:"
    pm2 status
    
    # Test API endpoint
    echo "🧪 Testing API endpoint..."
    curl -s http://72.167.227.205:5001/api/menu/brunch | head -c 200
    echo ""
    
    echo ""
    echo "✅ WHM root fix completed!"
    echo "============================================="
    echo "📋 Check these URLs:"
    echo "   Admin Panel: http://72.167.227.205:4000/menu-management?type=BRUNCH"
    echo "   Frontend: http://72.167.227.205:3003/brunch"
    echo "   API: http://72.167.227.205:5001/api/menu/brunch"
    echo "============================================="
EOF

echo ""
echo "🎯 WHM root access fix completed!"



