#!/bin/bash
# Script to check for Node.js and add to PATH if needed

echo "Checking for Node.js..."

# Check common locations
if [ -f "/usr/local/bin/node" ]; then
    echo "✓ Found Node.js at /usr/local/bin/node"
    echo "Version: $(/usr/local/bin/node --version)"
    echo ""
    echo "To use it, add to your ~/.zshrc:"
    echo "export PATH=\"/usr/local/bin:\$PATH\""
elif [ -f "/opt/homebrew/bin/node" ]; then
    echo "✓ Found Node.js at /opt/homebrew/bin/node"
    echo "Version: $(/opt/homebrew/bin/node --version)"
    echo ""
    echo "To use it, add to your ~/.zshrc:"
    echo "export PATH=\"/opt/homebrew/bin:\$PATH\""
else
    echo "✗ Node.js not found"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
fi
