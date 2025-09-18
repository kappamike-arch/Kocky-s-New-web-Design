#!/bin/bash

# Kocky's Bar & Grill - Stop Script

echo "🛑 Stopping Kocky's Bar & Grill services..."

pm2 stop all
pm2 delete all

echo "✅ All services stopped!"
