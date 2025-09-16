#!/bin/bash

# Migration script to replace hardcoded URLs with centralized configuration
# This script finds and replaces hardcoded localhost and IP addresses

set -e

echo "🔧 Starting hardcoded URL migration..."

# Define the project root
PROJECT_ROOT="/home/stagingkockys/Kocky's New Web Design with Back end/Kocky-s-New-web-Design/Kocky-s-New-web-Design"

# Change to project root
cd "$PROJECT_ROOT"

echo "📁 Working in: $PROJECT_ROOT"

# Function to replace URLs in a file
replace_urls_in_file() {
    local file="$1"
    echo "🔄 Processing: $file"
    
    # Replace hardcoded IP addresses with UPLOADS_URL
    sed -i 's|http://72\.167\.227\.205:5001|${UPLOADS_URL}|g' "$file"
    sed -i 's|http://127\.0\.0\.1:5001|${UPLOADS_URL}|g' "$file"
    sed -i 's|http://localhost:5001|${UPLOADS_URL}|g' "$file"
    
    # Replace hardcoded staging URLs with UPLOADS_URL
    sed -i 's|http://staging\.kockys\.com:5001|${UPLOADS_URL}|g' "$file"
    
    # Add import for UPLOADS_URL if not already present
    if grep -q "UPLOADS_URL" "$file" && ! grep -q "import.*UPLOADS_URL" "$file"; then
        # Find the last import statement and add UPLOADS_URL import after it
        if grep -q "import.*from.*react" "$file"; then
            sed -i '/import.*from.*react/a import { UPLOADS_URL } from '\''@/lib/config'\'';' "$file"
        elif grep -q "import.*from" "$file"; then
            sed -i '/import.*from/a import { UPLOADS_URL } from '\''@/lib/config'\'';' "$file"
        else
            # Add at the top if no imports found
            sed -i '1i import { UPLOADS_URL } from '\''@/lib/config'\'';' "$file"
        fi
    fi
}

# Find and process TypeScript/JavaScript files
echo "🔍 Finding files with hardcoded URLs..."

# Find files with hardcoded URLs
FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/.git/*" \
    -exec grep -l "http://72\.167\.227\.205\|http://127\.0\.0\.1\|http://localhost" {} \; 2>/dev/null)

if [ -z "$FILES" ]; then
    echo "✅ No files found with hardcoded URLs"
    exit 0
fi

echo "📋 Found files with hardcoded URLs:"
echo "$FILES"

# Process each file
for file in $FILES; do
    replace_urls_in_file "$file"
done

echo "✅ Migration completed!"
echo ""
echo "📝 Summary:"
echo "  - Replaced hardcoded IP addresses with UPLOADS_URL"
echo "  - Added necessary imports for centralized config"
echo "  - Files processed: $(echo "$FILES" | wc -l)"
echo ""
echo "🔍 Next steps:"
echo "  1. Review the changes made"
echo "  2. Test the application"
echo "  3. Commit the changes"
echo ""
echo "⚠️  Note: You may need to manually review some files for edge cases"
