#!/bin/bash

# Admin Panel Deployment Validation Script
# Validates MIME types and static asset delivery before going live

set -e

echo "🔍 Admin Panel Deployment Validation"
echo "===================================="

BASE_URL="https://staging.kockys.com"
ADMIN_PATH="/admin"
STATIC_PATH="/_next/static"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check MIME type
check_mime_type() {
    local url="$1"
    local expected_mime="$2"
    local file_type="$3"
    
    echo -n "Checking $file_type: $url ... "
    
    # Get the Content-Type header
    content_type=$(curl -s -I "$url" | grep -i "content-type:" | cut -d' ' -f2- | tr -d '\r\n')
    
    if [[ "$content_type" == *"$expected_mime"* ]]; then
        echo -e "${GREEN}✓${NC} ($content_type)"
        return 0
    else
        echo -e "${RED}✗${NC} Expected: $expected_mime, Got: $content_type"
        return 1
    fi
}

# Function to check if file exists and returns 200
check_file_exists() {
    local url="$1"
    local file_type="$2"
    
    echo -n "Checking $file_type exists: $url ... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [[ "$status_code" == "200" ]]; then
        echo -e "${GREEN}✓${NC} (200 OK)"
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $status_code)"
        return 1
    fi
}

# Function to get static asset URLs from the main page
get_static_assets() {
    local main_page_url="$BASE_URL$ADMIN_PATH/"
    echo "Fetching static asset URLs from main page..."
    
    # Get the HTML content and extract static asset URLs
    curl -s "$main_page_url" | grep -oE 'src="[^"]*_next/static/[^"]*"' | sed 's/src="//g' | sed 's/"//g' | head -10
}

echo "1. Testing main admin panel page..."
if ! check_file_exists "$BASE_URL$ADMIN_PATH/" "Main Page"; then
    echo -e "${RED}❌ Main admin panel page is not accessible${NC}"
    exit 1
fi

echo ""
echo "2. Testing static asset discovery..."
static_assets=$(get_static_assets)
if [[ -z "$static_assets" ]]; then
    echo -e "${YELLOW}⚠️  No static assets found in main page HTML${NC}"
    echo "This might indicate the page is not loading properly."
else
    echo "Found static assets:"
    echo "$static_assets"
fi

echo ""
echo "3. Testing common static asset types..."

# Test common static asset patterns
test_assets=(
    "$BASE_URL$ADMIN_PATH$STATIC_PATH/chunks/webpack-*.js:application/javascript:JavaScript Bundle"
    "$BASE_URL$ADMIN_PATH$STATIC_PATH/chunks/*.js:application/javascript:JavaScript Chunk"
    "$BASE_URL$ADMIN_PATH$STATIC_PATH/css/*.css:text/css:CSS File"
    "$BASE_URL$ADMIN_PATH$STATIC_PATH/media/*.woff2:font/woff2:WOFF2 Font"
    "$BASE_URL$ADMIN_PATH$STATIC_PATH/media/*.woff:font/woff:WOFF Font"
)

failed_tests=0

for test in "${test_assets[@]}"; do
    IFS=':' read -r pattern expected_mime file_type <<< "$test"
    
    # Find actual files matching the pattern
    actual_files=$(find "/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design/admin-panel/.next/static" -name "$(basename "$pattern")" 2>/dev/null | head -1)
    
    if [[ -n "$actual_files" ]]; then
        # Convert local path to URL
        relative_path=$(echo "$actual_files" | sed "s|.*\.next/static|$ADMIN_PATH$STATIC_PATH|")
        url="$BASE_URL$relative_path"
        
        if ! check_mime_type "$url" "$expected_mime" "$file_type"; then
            ((failed_tests++))
        fi
    else
        echo -e "${YELLOW}⚠️  No files found matching pattern: $pattern${NC}"
    fi
done

echo ""
echo "4. Testing cache headers..."
echo -n "Checking cache headers for JS files ... "
cache_header=$(curl -s -I "$BASE_URL$ADMIN_PATH$STATIC_PATH/chunks/" 2>/dev/null | grep -i "cache-control" | head -1)
if [[ "$cache_header" == *"immutable"* ]]; then
    echo -e "${GREEN}✓${NC} Immutable caching enabled"
else
    echo -e "${YELLOW}⚠️  Immutable caching not detected${NC}"
fi

echo ""
echo "5. Summary:"
if [[ $failed_tests -eq 0 ]]; then
    echo -e "${GREEN}✅ All MIME type validations passed!${NC}"
    echo -e "${GREEN}✅ Admin panel static assets are properly configured${NC}"
    exit 0
else
    echo -e "${RED}❌ $failed_tests MIME type validation(s) failed${NC}"
    echo -e "${RED}❌ Admin panel deployment validation failed${NC}"
    exit 1
fi
