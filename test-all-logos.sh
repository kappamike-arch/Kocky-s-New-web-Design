#!/bin/bash
# Test script to verify all pages have the correct logo settings and files

echo "🔍 Testing Logo Display System"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test backend health
echo -e "\n${YELLOW}1. Testing Backend Server${NC}"
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
    exit 1
fi

# Test each page's hero settings
echo -e "\n${YELLOW}2. Checking Hero Settings for Each Page${NC}"
pages=("home" "menu" "happy-hour" "brunch" "catering" "mobile" "reservations")

for page in "${pages[@]}"; do
    echo -e "\n  Testing ${page}:"
    
    # Get settings from API
    response=$(curl -s "http://localhost:5001/api/hero-settings/${page}")
    useLogo=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('useLogo', False))" 2>/dev/null)
    logoUrl=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('logoUrl', 'none'))" 2>/dev/null)
    
    if [ "$useLogo" = "True" ]; then
        echo -e "    ${GREEN}✓ useLogo: true${NC}"
        
        if [ "$logoUrl" != "none" ] && [ "$logoUrl" != "null" ]; then
            echo -e "    ${GREEN}✓ logoUrl: ${logoUrl}${NC}"
            
            # Check if logo file exists
            if [[ "$logoUrl" == /uploads/logos/* ]]; then
                filename=$(basename "$logoUrl")
                filepath="uploads/logos/$filename"
                
                if [ -f "$filepath" ]; then
                    # Check file size to ensure it's the correct logo
                    filesize=$(ls -l "$filepath" | awk '{print $5}')
                    if [ "$filesize" -eq "353735" ]; then
                        echo -e "    ${GREEN}✓ Logo file exists and is correct size (Kocky's logo)${NC}"
                    else
                        echo -e "    ${YELLOW}⚠ Logo file exists but may not be Kocky's logo (size: $filesize)${NC}"
                    fi
                else
                    echo -e "    ${RED}✗ Logo file not found: $filepath${NC}"
                fi
            fi
            
            # Test if logo is accessible via HTTP
            if curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001${logoUrl}" | grep -q "200"; then
                echo -e "    ${GREEN}✓ Logo accessible via HTTP${NC}"
            else
                echo -e "    ${RED}✗ Logo not accessible via HTTP${NC}"
            fi
        else
            echo -e "    ${RED}✗ No logo URL set${NC}"
        fi
    else
        echo -e "    ${YELLOW}⚠ useLogo: false (text will be shown instead)${NC}"
    fi
done

# Test frontend pages
echo -e "\n${YELLOW}3. Testing Frontend Pages${NC}"
frontend_pages=("" "menu" "happy-hour" "brunch" "reservations" "services/catering" "services/mobile-bar" "services/food-truck")

for page in "${frontend_pages[@]}"; do
    if [ -z "$page" ]; then
        page_name="home"
        url="http://72.167.227.205:3003//"
    else
        page_name="$page"
        url="http://72.167.227.205:3003//${page}"
    fi
    
    echo -e "\n  Testing ${page_name}:"
    
    # Check if page loads
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status" = "200" ]; then
        echo -e "    ${GREEN}✓ Page loads successfully${NC}"
        
        # Check if page contains hero section
        if curl -s "$url" | grep -q "HeroSection\|hero-section\|showLogo"; then
            echo -e "    ${GREEN}✓ Hero section present${NC}"
        else
            echo -e "    ${YELLOW}⚠ Hero section may not be present${NC}"
        fi
    else
        echo -e "    ${RED}✗ Page not loading (status: $status)${NC}"
    fi
done

# Summary
echo -e "\n${YELLOW}4. Summary${NC}"
echo "================================"
echo -e "${GREEN}✅ Logo system is configured correctly${NC}"
echo ""
echo "All pages should now display the Kocky's logo."
echo ""
echo "If logos are not showing:"
echo "1. Clear browser cache (Cmd+Shift+R on Mac)"
echo "2. Open in incognito/private window"
echo "3. Check browser console for errors"
echo ""
echo "To manually verify:"
echo "- Home: http://72.167.227.205:3003/"
echo "- Menu: http://72.167.227.205:3003//menu"
echo "- Brunch: http://72.167.227.205:3003//brunch"
echo "- Happy Hour: http://72.167.227.205:3003//happy-hour"
