#!/bin/bash

echo "🔍 Testing Hero Settings Sync Between Admin and Frontend"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Backend API
echo -e "\n${YELLOW}1. Testing Backend API:${NC}"
BRUNCH_RESPONSE=$(curl -s http://localhost:5001/api/hero-settings/brunch)
echo "Brunch API Response:"
echo "$BRUNCH_RESPONSE" | jq '.'

# Extract values
USE_LOGO=$(echo "$BRUNCH_RESPONSE" | jq -r '.useLogo')
LOGO_URL=$(echo "$BRUNCH_RESPONSE" | jq -r '.logoUrl')
TITLE=$(echo "$BRUNCH_RESPONSE" | jq -r '.title')
SUBTITLE=$(echo "$BRUNCH_RESPONSE" | jq -r '.subtitle')

echo -e "\n${YELLOW}2. Current Settings:${NC}"
echo "- Use Logo: $USE_LOGO"
echo "- Logo URL: $LOGO_URL"
echo "- Title: $TITLE"
echo "- Subtitle: $SUBTITLE"

# 2. Check if logo file exists
echo -e "\n${YELLOW}3. Checking Logo File:${NC}"
if [ ! -z "$LOGO_URL" ] && [ "$LOGO_URL" != "null" ]; then
    # Remove /uploads/ prefix and check file
    FILE_PATH="uploads/${LOGO_URL#/uploads/}"
    if [ -f "$FILE_PATH" ]; then
        echo -e "${GREEN}✅ Logo file exists: $FILE_PATH${NC}"
        ls -la "$FILE_PATH"
    else
        echo -e "${RED}❌ Logo file NOT found: $FILE_PATH${NC}"
    fi
else
    echo "No logo URL set"
fi

# 3. Test batch save endpoint
echo -e "\n${YELLOW}4. Testing Batch Save Endpoint:${NC}"
BATCH_RESPONSE=$(curl -s -X POST http://localhost:5001/api/hero-settings/batch \
  -H "Content-Type: application/json" \
  -d '{"settings":[{"id":"brunch","useLogo":true,"logoUrl":"'$LOGO_URL'","title":"'$TITLE'","subtitle":"'$SUBTITLE'"}]}')
  
echo "Batch Save Response: $BATCH_RESPONSE"

# 4. Check if backend is serving the logo
echo -e "\n${YELLOW}5. Testing Logo Access via Backend:${NC}"
if [ ! -z "$LOGO_URL" ] && [ "$LOGO_URL" != "null" ]; then
    LOGO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5001$LOGO_URL")
    if [ "$LOGO_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Logo accessible via backend (Status: $LOGO_STATUS)${NC}"
    else
        echo -e "${RED}❌ Logo NOT accessible via backend (Status: $LOGO_STATUS)${NC}"
    fi
fi

# 5. Check frontend page
echo -e "\n${YELLOW}6. Testing Frontend Page Load:${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://72.167.227.205:3003//brunch)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Brunch page loads successfully (Status: $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Brunch page failed to load (Status: $FRONTEND_STATUS)${NC}"
fi

# 6. Test updating a setting
echo -e "\n${YELLOW}7. Testing Setting Update:${NC}"
NEW_SUBTITLE="BUTTA BRUNCH - Updated $(date +%s)"
UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:5001/api/hero-settings/brunch" \
  -H "Content-Type: application/json" \
  -d '{"subtitle":"'$NEW_SUBTITLE'"}')
  
echo "Update Response:"
echo "$UPDATE_RESPONSE" | jq '.'

# 7. Verify update
echo -e "\n${YELLOW}8. Verifying Update:${NC}"
VERIFY_RESPONSE=$(curl -s http://localhost:5001/api/hero-settings/brunch)
NEW_SUBTITLE_CHECK=$(echo "$VERIFY_RESPONSE" | jq -r '.subtitle')
if [ "$NEW_SUBTITLE_CHECK" = "$NEW_SUBTITLE" ]; then
    echo -e "${GREEN}✅ Update successful! New subtitle: $NEW_SUBTITLE_CHECK${NC}"
else
    echo -e "${RED}❌ Update failed! Subtitle is: $NEW_SUBTITLE_CHECK${NC}"
fi

echo -e "\n${YELLOW}========== Test Complete ==========${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Visit http://72.167.227.205:3003//brunch in your browser"
echo "2. Check if the Butta Brunch logo is displayed"
echo "3. Try updating settings in the admin panel at http://localhost:4000/hero-settings"
echo "4. Hard refresh the frontend (Cmd+Shift+R) to see changes"
