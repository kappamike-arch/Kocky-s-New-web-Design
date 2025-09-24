#!/bin/bash

echo "🔄 Restarting Quote System Server..."
echo "====================================="

# Kill existing server processes
echo "1. Killing existing server processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "dist/server.js" 2>/dev/null || true

# Wait a moment for processes to die
sleep 2

# Check if port 5001 is still in use
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null ; then
    echo "   ⚠️  Port 5001 still in use, force killing..."
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# Build the project
echo "2. Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "   ❌ Build failed!"
    exit 1
fi

echo "   ✅ Build successful"

# Start the server
echo "3. Starting the server..."
nohup node -r dotenv/config dist/server.js -p 5001 > server.log 2>&1 &

# Wait for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "   ✅ Server started successfully on port 5001"
    echo "   📋 Server logs: tail -f server.log"
    echo "   🧪 Test the system: node test-quote-system-fixed.js"
else
    echo "   ❌ Server failed to start"
    echo "   📋 Check logs: tail -f server.log"
    exit 1
fi

echo ""
echo "🎉 Server restart complete!"
echo "====================================="
echo "Ready to test the quote system with all fixes applied!"

