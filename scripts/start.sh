#!/bin/bash

# Kocky's Bar & Grill - Startup Script

echo "🚀 Starting Kocky's Bar & Grill services..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing globally..."
    npm install -g pm2
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start all services with PM2
pm2 start config/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up auto-start on reboot
pm2 startup

echo "✅ All services started!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "📝 Useful commands:"
echo "  • View logs: pm2 logs"
echo "  • Stop all: pm2 stop all"
echo "  • Restart all: pm2 restart all"
echo "  • Monitor: pm2 monit"
