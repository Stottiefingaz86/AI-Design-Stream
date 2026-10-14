#!/bin/bash
# Start the Next.js dev server and show output

cd "$(dirname "$0")"

echo "=========================================="
echo "Starting Next.js Development Server"
echo "=========================================="
echo ""
echo "This will start the server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""
echo "=========================================="
echo ""

npm run dev
