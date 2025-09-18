#!/bin/bash

# Kocky's Bar & Grill - Health Check Script

echo "🏥 Running health checks..."

# Check backend
echo -n "Backend API: "
curl -s http://localhost:5001/api/health > /dev/null && echo "✅ UP" || echo "❌ DOWN"

# Check frontend
echo -n "Frontend: "
curl -s http://72.167.227.205:3003/ > /dev/null && echo "✅ UP" || echo "❌ DOWN"

# Check admin panel
echo -n "Admin Panel: "
curl -s http://localhost:4000 > /dev/null && echo "✅ UP" || echo "❌ DOWN"

# Check database
echo -n "Database: "
if [ -f backend/prisma/kockys.db ]; then
    echo "✅ EXISTS"
else
    echo "❌ NOT FOUND"
fi

# Check PM2 processes
echo ""
echo "📊 PM2 Status:"
pm2 status
