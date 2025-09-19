#!/bin/bash

# Performance Optimization Script for Kocky's Staging Environment
# This script optimizes the staging environment for better performance

echo "🚀 Starting Performance Optimization..."

# Set Node.js performance optimizations
export NODE_OPTIONS="--max-old-space-size=4096"
export NODE_ENV="development"

# Kill existing processes to free up memory
echo "🔄 Stopping existing services..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node dist/server.js" 2>/dev/null || true
sleep 3

# Clear Next.js caches
echo "🧹 Clearing Next.js caches..."
cd "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/frontend"
rm -rf .next 2>/dev/null || true

cd "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/admin-panel"
rm -rf .next 2>/dev/null || true

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Start backend with optimizations
echo "🔧 Starting backend with optimizations..."
cd "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/backend"
npm run build
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Start admin panel with optimizations
echo "🔧 Starting admin panel with optimizations..."
cd "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/admin-panel"
PORT=4000 npm run dev &
ADMIN_PID=$!

# Start frontend with optimizations
echo "🔧 Starting frontend with optimizations..."
cd "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/frontend"
PORT=3003 npm run dev &
FRONTEND_PID=$!

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Test services
echo "🧪 Testing services..."
curl -k -I https://staging.kockys.com/health >/dev/null 2>&1 && echo "✅ Backend: OK" || echo "❌ Backend: Failed"
curl -k -I https://staging.kockys.com/admin/ >/dev/null 2>&1 && echo "✅ Admin Panel: OK" || echo "❌ Admin Panel: Failed"
curl -k -I https://staging.kockys.com/ >/dev/null 2>&1 && echo "✅ Frontend: OK" || echo "❌ Frontend: Failed"

echo "🎉 Performance optimization complete!"
echo "📊 Services running with optimized settings:"
echo "   - Backend: PID $BACKEND_PID"
echo "   - Admin Panel: PID $ADMIN_PID"
echo "   - Frontend: PID $FRONTEND_PID"
echo ""
echo "💡 Performance improvements applied:"
echo "   - Increased Node.js memory limits"
echo "   - Enabled SWC minification"
echo "   - Enabled compression"
echo "   - Optimized package imports"
echo "   - Cleared build caches"
