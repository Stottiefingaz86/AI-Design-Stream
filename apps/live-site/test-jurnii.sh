#!/bin/bash
# Test script for Jurnii integration

echo "Testing Jurnii UX Report Extraction..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Server is not running. Please start with: npm run dev"
  exit 1
fi

echo "✅ Server is running"
echo ""

# Test the endpoint
echo "Calling /api/ux-report with Jurnii URL..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/ux-report \
  -H "Content-Type: application/json" \
  -d '{"url": "https://app.jurnii.io/user-reports/competitor/2c5eb20f-b28e-404c-a75f-515f22d9c004"}')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if reports were added
echo "Checking if reports were added..."
REPORTS=$(curl -s http://localhost:3000/api/ux-report | jq '.count' 2>/dev/null || echo "0")
echo "Reports in knowledge base: $REPORTS"
echo ""

if [ "$REPORTS" -gt "0" ]; then
  echo "✅ Success! Reports were added to the knowledge base."
else
  echo "❌ No reports found. Check the response above for errors."
fi
