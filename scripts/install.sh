#!/bin/bash

# Kocky's Bar & Grill - Installation Script

echo "🍔 Installing Kocky's Bar & Grill..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "Please do not run this script as root"
   exit 1
fi

# Create logs directory
mkdir -p logs

# Copy environment file
cp config/.env.production .env
echo "⚠️  Please edit .env file with your production values before proceeding!"
read -p "Press enter when ready to continue..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --production
cd ..

# Install admin panel dependencies
echo "📦 Installing admin panel dependencies..."
cd admin-panel
npm install --production
cd ..

# Create upload directories
mkdir -p backend/uploads/{logos,menu,gallery,documents}
chmod -R 755 backend/uploads

echo "✅ Installation complete!"
echo "Run ./scripts/start.sh to start all services"
