#!/bin/bash

echo "🍳 KOCKY'S BRUNCH SYNC FIX - ROOT ACCESS VERSION"
echo "================================================"
echo "Running as root user..."
echo ""

# Switch to the stagingkockys user
echo "🔄 Switching to stagingkockys user..."
su - stagingkockys -c "
    echo '📍 Current user: \$(whoami)'
    echo '📍 Current directory: \$(pwd)'
    
    # Navigate to backend directory
    cd /home/stagingkockys/public_html/current/backend
    echo '📍 Backend directory: \$(pwd)'
    
    # Check if Node.js is available
    echo '🔍 Checking Node.js...'
    node -v || echo '❌ Node.js not found'
    
    # Check if PM2 is available
    echo '🔍 Checking PM2...'
    pm2 -v || echo '❌ PM2 not found'
    
    # Run the fix script
    echo '🔧 Running brunch sync fix...'
    node test-and-fix.js
    
    # Restart backend server
    echo '🔄 Restarting backend server...'
    pm2 restart kockys-backend
    
    # Wait for restart
    echo '⏳ Waiting for server restart...'
    sleep 5
    
    # Check PM2 status
    echo '📊 PM2 Status:'
    pm2 status
    
    echo ''
    echo '✅ Fix completed!'
    echo '==============================================='
    echo '📋 Check these URLs:'
    echo '   Admin Panel: http://72.167.227.205:4000/menu-management?type=BRUNCH'
    echo '   Frontend: http://72.167.227.205:3003/brunch'
    echo '   API: http://72.167.227.205:5001/api/menu/brunch'
    echo '==============================================='
"

echo ""
echo "🎯 Root access fix completed!"



