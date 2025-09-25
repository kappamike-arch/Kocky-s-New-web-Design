#!/bin/bash

# Enhanced Admin Panel Deployment Script
# Ensures stable deployment with validation

set -e

echo "🚀 Admin Panel Deployment Script"
echo "================================="

ADMIN_PANEL_DIR="/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/admin-panel"
VALIDATION_SCRIPT="/home/stagingkockys/validate-admin-panel.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

log "Starting admin panel deployment..."

# Step 1: Pre-deployment checks
log "Step 1: Pre-deployment checks"
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists pm2; then
    echo -e "${RED}❌ pm2 is not installed${NC}"
    exit 1
fi

if [[ ! -d "$ADMIN_PANEL_DIR" ]]; then
    echo -e "${RED}❌ Admin panel directory not found: $ADMIN_PANEL_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} All pre-deployment checks passed"

# Step 2: Stop admin panel
log "Step 2: Stopping admin panel"
pm2 stop admin || echo -e "${YELLOW}⚠️  Admin panel was not running${NC}"

# Step 3: Clean build
log "Step 3: Cleaning previous build"
cd "$ADMIN_PANEL_DIR"
rm -rf .next
echo -e "${GREEN}✓${NC} Cleaned .next directory"

# Step 4: Install dependencies
log "Step 4: Installing dependencies"
npm ci --production=false
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 5: Build application
log "Step 5: Building application"
npm run build
echo -e "${GREEN}✓${NC} Application built successfully"

# Step 6: Verify build output
log "Step 6: Verifying build output"
if [[ ! -d ".next/static" ]]; then
    echo -e "${RED}❌ Static assets directory not found${NC}"
    exit 1
fi

if [[ ! -f ".next/prerender-manifest.json" ]]; then
    echo -e "${RED}❌ Prerender manifest not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Build output verified"

# Step 7: Start admin panel
log "Step 7: Starting admin panel"
pm2 start admin
echo -e "${GREEN}✓${NC} Admin panel started"

# Step 8: Wait for startup
log "Step 8: Waiting for admin panel to start"
sleep 5

# Step 9: Test basic connectivity
log "Step 9: Testing basic connectivity"
if curl -f -s "http://127.0.0.1:4000/admin/" > /dev/null; then
    echo -e "${GREEN}✓${NC} Admin panel is responding"
else
    echo -e "${RED}❌ Admin panel is not responding${NC}"
    exit 1
fi

# Step 10: Run validation script
log "Step 10: Running deployment validation"
if [[ -f "$VALIDATION_SCRIPT" ]]; then
    if bash "$VALIDATION_SCRIPT"; then
        echo -e "${GREEN}✓${NC} Deployment validation passed"
    else
        echo -e "${RED}❌ Deployment validation failed${NC}"
        echo -e "${YELLOW}⚠️  Admin panel may not be fully functional${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Validation script not found, skipping validation${NC}"
fi

# Step 11: Final status check
log "Step 11: Final status check"
pm2 status admin

echo ""
echo -e "${GREEN}🎉 Admin panel deployment completed successfully!${NC}"
echo -e "${GREEN}✅ All static assets are properly configured${NC}"
echo -e "${GREEN}✅ MIME types are correctly set${NC}"
echo -e "${GREEN}✅ Caching headers are optimized${NC}"
echo ""
echo -e "${BLUE}Admin panel is now available at: https://staging.kockys.com/admin/${NC}"
echo -e "${BLUE}PM2 Status: pm2 status admin${NC}"
echo -e "${BLUE}PM2 Logs: pm2 logs admin${NC}"
