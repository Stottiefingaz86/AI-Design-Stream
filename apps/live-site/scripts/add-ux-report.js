/**
 * Helper script to add UX reports to the knowledge base
 * 
 * Usage:
 *   node scripts/add-ux-report.js
 * 
 * Or use the API endpoint:
 *   curl -X POST http://localhost:3000/api/ux-report \
 *     -H "Content-Type: application/json" \
 *     -d @ux-report.json
 */

const fs = require('fs');
const path = require('path');

// Example UX report structure
const exampleReport = {
  id: 'jurnii-competitor-001',
  source: 'Jurnii',
  sourceUrl: 'https://app.jurnii.io/user-reports/competitor/2c5eb20f-b28e-404c-a75f-515f22d9c004',
  title: 'Competitor UX Analysis - Site Improvements',
  date: new Date().toISOString().split('T')[0],
  findings: [
    {
      issue: 'Navigation clarity',
      severity: 'high', // critical, high, medium, low
      description: 'Users struggle to find key features in the navigation',
      recommendation: 'Improve navigation hierarchy and add clear labels',
      affectedArea: 'Navigation' // Optional: Casino, Sports, Loyalty, Navigation, etc.
    },
    {
      issue: 'Button visibility',
      severity: 'medium',
      description: 'Primary CTAs are not prominent enough',
      recommendation: 'Increase button size and use higher contrast colors',
      affectedArea: 'Casino'
    }
  ],
  summary: 'Overall UX improvements needed for better user engagement',
  priority: 'high' // high, medium, low
};

console.log('Example UX Report Structure:');
console.log(JSON.stringify(exampleReport, null, 2));
console.log('\nTo add this report:');
console.log('1. Save it to a file (e.g., ux-report.json)');
console.log('2. Use the API: POST /api/ux-report with { "manual": true, "reportData": {...} }');
console.log('3. Or add it directly to lib/agent/knowledgeBase.ts in the uxReports array');
