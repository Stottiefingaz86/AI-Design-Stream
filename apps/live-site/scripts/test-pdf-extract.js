const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'reports', 'Design Vision.pdf');
console.log('Testing PDF extraction from:', filePath);

const buffer = fs.readFileSync(filePath);
pdfParse(buffer).then(data => {
  console.log('✅ Success! Text length:', data.text.length);
  console.log('First 200 chars:', data.text.substring(0, 200));
}).catch(e => {
  console.error('❌ Error:', e.message);
});
