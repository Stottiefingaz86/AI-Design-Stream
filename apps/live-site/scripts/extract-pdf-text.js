// Simple test script to extract PDF text using CommonJS
const mod = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// pdf-parse might export differently - check if it's a function or has a default
const pdfParse = typeof mod === 'function' ? mod : (mod.default || mod.pdfParse || mod);

if (typeof pdfParse !== 'function') {
  console.error('❌ pdf-parse is not a function. Type:', typeof mod);
  console.log('Keys:', Object.keys(mod).slice(0, 10));
  process.exit(1);
}

const reportsDir = path.join(__dirname, '..', 'public', 'reports');
const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.pdf'));

console.log(`Found ${files.length} PDF files\n`);

files.forEach(async (file) => {
  const filePath = path.join(reportsDir, file);
  console.log(`Extracting: ${file}`);
  
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    console.log(`  ✅ Success! ${data.text.length} characters extracted`);
    console.log(`  First 100 chars: ${data.text.substring(0, 100).replace(/\n/g, ' ')}...\n`);
  } catch (e) {
    console.error(`  ❌ Error: ${e.message}\n`);
  }
});
