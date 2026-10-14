#!/bin/bash
# Diagnostic script to check server status

echo "=== SERVER DIAGNOSTICS ==="
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js found: $(node --version)"
else
    echo "   ✗ Node.js NOT FOUND"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
echo ""
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    echo "   ✓ npm found: $(npm --version)"
else
    echo "   ✗ npm NOT FOUND"
    exit 1
fi

# Check dependencies
echo ""
echo "3. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules exists"
else
    echo "   ✗ node_modules missing - run: npm install"
    exit 1
fi

# Check ports
echo ""
echo "4. Checking ports..."
for port in 3000 3001 3002 3003; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "   Port $port: IN USE"
        echo "   Process: $(lsof -ti:$port | xargs ps -p 2>/dev/null | tail -1 || echo 'unknown')"
    else
        echo "   Port $port: AVAILABLE"
    fi
done

# Check if server is running
echo ""
echo "5. Checking for running Next.js processes..."
if pgrep -f "next dev" > /dev/null; then
    echo "   ✓ Next.js dev server is running"
    echo "   PID: $(pgrep -f 'next dev')"
else
    echo "   ✗ Next.js dev server is NOT running"
    echo ""
    echo "   To start the server, run:"
    echo "   npm run dev"
fi

echo ""
echo "=== DIAGNOSTICS COMPLETE ==="
