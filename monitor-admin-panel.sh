#!/bin/bash

# Admin Panel Health Monitoring Script
# Monitors static asset delivery and MIME types

set -e

echo "📊 Admin Panel Health Monitor"
echo "============================="

BASE_URL="https://staging.kockys.com"
ADMIN_PATH="/admin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check health
check_health() {
    local url="$1"
    local name="$2"
    
    echo -n "Checking $name ... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    content_type=$(curl -s -I "$url" 2>/dev/null | grep -i "content-type:" | cut -d' ' -f2- | tr -d '\r\n')
    
    if [[ "$status_code" == "200" ]]; then
        echo -e "${GREEN}✓${NC} (200 OK, $content_type)"
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $status_code)"
        return 1
    fi
}

# Function to check PM2 status
check_pm2_status() {
    echo -n "Checking PM2 admin process ... "
    
    if pm2 list | grep -q "admin.*online"; then
        echo -e "${GREEN}✓${NC} (Online)"
        return 0
    else
        echo -e "${RED}✗${NC} (Offline or Error)"
        return 1
    fi
}

echo "1. System Health Checks"
check_pm2_status
check_health "$BASE_URL$ADMIN_PATH/" "Main Admin Page"

echo ""
echo "2. Static Asset Health Checks"
check_health "$BASE_URL$ADMIN_PATH/_next/static/chunks/" "JavaScript Chunks Directory"
check_health "$BASE_URL$ADMIN_PATH/_next/static/css/" "CSS Directory"
check_health "$BASE_URL$ADMIN_PATH/_next/static/media/" "Media Directory"

echo ""
echo "3. MIME Type Validation"
echo -n "Testing JavaScript MIME type ... "
js_mime=$(curl -s -I "$BASE_URL$ADMIN_PATH/_next/static/chunks/1255-0c4ae1a928c971f3.js" 2>/dev/null | grep -i "content-type:" | cut -d' ' -f2- | tr -d '\r\n')
if [[ "$js_mime" == *"application/javascript"* ]]; then
    echo -e "${GREEN}✓${NC} ($js_mime)"
else
    echo -e "${RED}✗${NC} ($js_mime)"
fi

echo ""
echo "4. Cache Headers Validation"
echo -n "Testing cache headers ... "
cache_header=$(curl -s -I "$BASE_URL$ADMIN_PATH/_next/static/chunks/1255-0c4ae1a928c971f3.js" 2>/dev/null | grep -i "cache-control" | head -1)
if [[ "$cache_header" == *"immutable"* ]]; then
    echo -e "${GREEN}✓${NC} (Immutable caching enabled)"
else
    echo -e "${YELLOW}⚠️${NC} (Immutable caching not detected)"
fi

echo ""
echo "5. Performance Check"
echo -n "Testing response time ... "
response_time=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL$ADMIN_PATH/")
echo -e "${GREEN}✓${NC} (${response_time}s)"

echo ""
echo "📋 Health Summary:"
echo "=================="
echo "• Admin Panel: $(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ADMIN_PATH/" | sed 's/200/✅ Healthy/' | sed 's/[0-9][0-9][0-9]/❌ Unhealthy/')"
echo "• Static Assets: $(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$ADMIN_PATH/_next/static/chunks/" | sed 's/200/✅ Healthy/' | sed 's/[0-9][0-9][0-9]/❌ Unhealthy/')"
echo "• MIME Types: $(curl -s -I "$BASE_URL$ADMIN_PATH/_next/static/chunks/1255-0c4ae1a928c971f3.js" 2>/dev/null | grep -i "content-type:" | grep -q "application/javascript" && echo "✅ Correct" || echo "❌ Incorrect")"
echo "• Caching: $(curl -s -I "$BASE_URL$ADMIN_PATH/_next/static/chunks/1255-0c4ae1a928c971f3.js" 2>/dev/null | grep -i "cache-control" | grep -q "immutable" && echo "✅ Optimized" || echo "⚠️  Not Optimized")"

echo ""
echo "🔧 Maintenance Commands:"
echo "========================"
echo "• Deploy: bash /home/stagingkockys/deploy-admin-panel.sh"
echo "• Validate: bash /home/stagingkockys/validate-admin-panel.sh"
echo "• Monitor: bash /home/stagingkockys/monitor-admin-panel.sh"
echo "• PM2 Status: pm2 status admin"
echo "• PM2 Logs: pm2 logs admin --lines 50"
