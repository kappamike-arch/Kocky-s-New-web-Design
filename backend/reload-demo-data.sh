#!/bin/bash

# Demo Data Reload Script for Kocky's Restaurant
# This script reloads all sample/demo data into the staging database

echo "🚀 Starting Demo Data Reload for Kocky's Restaurant..."

# Change to backend directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in backend directory. Please run from backend folder."
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Function to run a seed script
run_seed() {
    local script_name=$1
    local description=$2
    
    echo "🌱 Running $description..."
    if npx ts-node "$script_name"; then
        echo "✅ $description completed successfully"
    else
        echo "❌ $description failed"
        return 1
    fi
}

# Function to check database status
check_db() {
    echo "📊 Checking database status..."
    echo "Menu items by type:"
    sqlite3 prisma/dev.db "SELECT menuType, COUNT(*) as count FROM MenuItem GROUP BY menuType;"
    echo ""
    echo "Total inquiries:"
    sqlite3 prisma/dev.db "SELECT COUNT(*) as total FROM ContactInquiry;"
    echo ""
    echo "Total bookings:"
    sqlite3 prisma/dev.db "SELECT COUNT(*) as food_truck FROM FoodTruckBooking; SELECT COUNT(*) as mobile_bar FROM MobileBarBooking;"
}

echo "📊 Database status BEFORE reload:"
check_db

echo ""
echo "🔄 Starting data reload process..."

# 1. Run main seed script (creates basic data)
run_seed "prisma/seed.ts" "Main Database Seed"

# 2. Run brunch items seed
run_seed "src/seed-brunch-items.ts" "Brunch Items Seed"

# 3. Run content management seed (creates all menu types)
run_seed "src/seed-content.ts" "Content Management Seed"

# 4. Run CRM data seed (creates bookings and inquiries)
run_seed "src/seed-crm-data.ts" "CRM Data Seed"

# 5. Run happy hour seed
run_seed "src/seed-happy-hour.ts" "Happy Hour Seed"

echo ""
echo "📊 Database status AFTER reload:"
check_db

echo ""
echo "🎉 Demo data reload completed!"
echo ""
echo "📋 What was loaded:"
echo "✅ Menu Items: Regular, Happy Hour, Brunch, Specials"
echo "✅ Contact Inquiries: Food Truck, Catering, Mobile Bar, General"
echo "✅ Bookings: Food Truck and Mobile Bar bookings"
echo "✅ Reservations: Test reservations"
echo "✅ Quotes: Sample quotes"
echo "✅ Gallery Items: Sample gallery items"
echo "✅ Page Content: All page content"
echo ""
echo "🌐 Your demo data is now ready for testing!"
echo "Frontend: http://staging.kockys.com:3003"
echo "Admin Panel: http://staging.kockys.com:4000"
echo "Backend API: http://staging.kockys.com:5001"


