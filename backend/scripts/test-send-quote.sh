#!/bin/bash

# Test script for Send Quote API using curl
# 
# Usage: ./test-send-quote.sh <QUOTE_ID> [mode]
# 
# Examples:
#   ./test-send-quote.sh "quote-id-123" deposit
#   ./test-send-quote.sh "quote-id-123" full

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Set default values
BASE_URL=${APP_BASE_URL:-"http://localhost:5001"}
QUOTE_ID=${1}
MODE=${2:-"deposit"}

# Validate inputs
if [ -z "$QUOTE_ID" ]; then
    echo "❌ Error: Quote ID is required"
    echo ""
    echo "Usage:"
    echo "  ./test-send-quote.sh <QUOTE_ID> [mode]"
    echo ""
    echo "Examples:"
    echo "  ./test-send-quote.sh \"quote-id-123\" deposit"
    echo "  ./test-send-quote.sh \"quote-id-123\" full"
    exit 1
fi

if [ "$MODE" != "deposit" ] && [ "$MODE" != "full" ]; then
    echo "❌ Error: Invalid mode. Must be 'deposit' or 'full'"
    exit 1
fi

echo "🚀 Testing Send Quote API"
echo "====================================="
echo "Base URL: $BASE_URL"
echo "Quote ID: $QUOTE_ID"
echo "Mode: $MODE"
echo ""

# Test 1: Get quote details
echo "📋 Test 1: Retrieving quote details..."
QUOTE_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/quotes/$QUOTE_ID")
QUOTE_HTTP_CODE=$(echo "$QUOTE_RESPONSE" | tail -n1)
QUOTE_BODY=$(echo "$QUOTE_RESPONSE" | head -n -1)

if [ "$QUOTE_HTTP_CODE" -eq 200 ]; then
    echo "✅ Quote retrieved successfully"
    echo "$QUOTE_BODY" | jq -r '.quote | "   Quote Number: \(.quoteNumber // "N/A")\n   Customer: \(.inquiry.name // "N/A")\n   Email: \(.inquiry.email // "N/A")\n   Total: $\(.amount // "N/A")"'
else
    echo "❌ Failed to retrieve quote (HTTP $QUOTE_HTTP_CODE)"
    echo "$QUOTE_BODY"
    exit 1
fi

echo ""

# Test 2: Send quote
echo "📧 Test 2: Sending quote..."
SEND_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"mode\":\"$MODE\"}" \
    "$BASE_URL/api/quotes/$QUOTE_ID/send")

SEND_HTTP_CODE=$(echo "$SEND_RESPONSE" | tail -n1)
SEND_BODY=$(echo "$SEND_RESPONSE" | head -n -1)

if [ "$SEND_HTTP_CODE" -eq 200 ]; then
    echo "✅ Quote sent successfully!"
    echo "$SEND_BODY" | jq -r '"   Checkout URL: " + (.checkoutUrl // "N/A")'
    echo "$SEND_BODY" | jq -r '"   Session ID: " + (.sessionId // "N/A")'
    echo ""
    echo "🎉 All tests passed!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Check your email for the quote"
    echo "   2. Verify the PDF attachment is included"
    echo "   3. Test the Stripe checkout link"
    echo "   4. Check the database for updated quote status"
else
    echo "❌ Failed to send quote (HTTP $SEND_HTTP_CODE)"
    echo "$SEND_BODY"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check server logs for detailed error messages"
    echo "   2. Verify Stripe configuration in .env"
    echo "   3. Ensure email service is properly configured"
    echo "   4. Check that the quote has a valid customer email"
fi

echo ""
echo "====================================="
echo "🏁 Test completed"


