#!/bin/bash
cd /Users/christopherhunt/AIagency
pkill -f "next dev" 2>/dev/null
rm -rf .next
npm run dev
