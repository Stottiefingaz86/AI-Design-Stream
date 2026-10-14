/**
 * Script to extract logos from Figma MCP localhost server
 * and save them to the correct paths in public/logos/
 * 
 * This script downloads SVG assets from the Figma MCP server
 * and organizes them by brand, type, and color.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Logo mapping: nodeId -> { brand, type, color, assetUrls }
const logoMap = {
  // BetOnline Wordmark Primary (has 2 parts: BET + ONLINE)
  '2444:7450': {
    brand: 'BetOnline',
    type: 'wordmark',
    color: 'primary',
    assets: [
      'http://localhost:3845/assets/342a795c377fd33db1ad055418f04d7c35cbdbef.svg', // ONLINE
      'http://localhost:3845/assets/8613a19c9ab25b5f8deeaa3dcf14760243de0062.svg', // BET
    ],
    combine: true // Combine multiple assets into one SVG
  },
  // BetOnline Wordmark White (single asset)
  '2444:7541': {
    brand: 'BetOnline',
    type: 'wordmark',
    color: 'white',
    assets: [
      'http://localhost:3845/assets/7b639b689c952a4f0bb9a6e4b35c98c3f13f4f46.svg'
    ]
  },
  // BetOnline Lettermark Primary (single asset)
  '2450:8659': {
    brand: 'BetOnline',
    type: 'lettermark',
    color: 'primary',
    assets: [
      'http://localhost:3845/assets/f9a895fef5453e87c016d2893fbc7182978c5060.svg'
    ]
  },
  // BetOnline Lettermark White (single asset)
  '2450:8643': {
    brand: 'BetOnline',
    type: 'lettermark',
    color: 'white',
    assets: [
      'http://localhost:3845/assets/3e2a932beeedae69cc7147a06bdbebac35db798c.svg'
    ]
  },
  // BetOnline Wordmark Black (single asset)
  '2444:7517': {
    brand: 'BetOnline',
    type: 'wordmark',
    color: 'black',
    assets: [
      'http://localhost:3845/assets/eacab46361ef00127baa4a0c7e18ac70c9df7752.svg'
    ]
  },
  // BetOnline Lettermark Black (single asset)
  '2450:8651': {
    brand: 'BetOnline',
    type: 'lettermark',
    color: 'black',
    assets: [
      'http://localhost:3845/assets/eb7bcc960d1b95dfc5d04ac16cb67af6d3e7ff7d.svg'
    ]
  },
  // SportsBetting Wordmark Primary (multiple parts)
  '2607:2907': {
    brand: 'SportsBetting',
    type: 'wordmark',
    color: 'primary',
    assets: [
      'http://localhost:3845/assets/1d9e04d0abcdbaa06338f5b895ddeff01b43fb22.svg',
      'http://localhost:3845/assets/1ef148d0e009b5ba6aed354054b26278f572a0f1.svg',
      'http://localhost:3845/assets/d54e0a008137aebc003c56e3131c0c5d068d3183.svg',
      'http://localhost:3845/assets/2616fca823e1065477e460e88298f33e5d69572d.svg',
      'http://localhost:3845/assets/f280208ae0c80428967a9b921475721579e64457.svg',
      'http://localhost:3845/assets/aeabe8aef2f0c6f73954679ff4d189e8b96081f1.svg',
      'http://localhost:3845/assets/341fb781f8a0828c2cc4b0c950d4fcd0840641a3.svg',
      'http://localhost:3845/assets/e4df0a4f27e27d5d9417f199d58a0914411d8499.svg',
      'http://localhost:3845/assets/0802b9a62e9667eede196d6a33ada8ba2814f053.svg',
      'http://localhost:3845/assets/db47ccbce655ced08aba8d6bbe94f4bc299d3f62.svg',
      'http://localhost:3845/assets/bb36a41b99dc616f76f303b8945a5f8c91e4dc33.svg',
      'http://localhost:3845/assets/127c3281d82920ec7154532c284a403bc29ef735.svg',
    ],
    combine: true
  },
};

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    let data = '';
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(data);
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function combineSVGs(svgContents) {
  // Extract viewBox and content from first SVG
  const firstSVG = svgContents[0];
  const viewBoxMatch = firstSVG.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 100 100';
  
  // Extract all <g> or <path> elements from all SVGs
  let combinedContent = '';
  svgContents.forEach((svg) => {
    // Extract content between <svg> tags (remove the outer svg wrapper)
    const contentMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    if (contentMatch) {
      combinedContent += contentMatch[1];
    }
  });
  
  // Create combined SVG
  return `<svg preserveAspectRatio="none" width="100%" height="100%" overflow="visible" style="display: block;" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
${combinedContent}
</svg>`;
}

async function extractLogos() {
  const baseDir = path.join(__dirname, '..', 'public', 'logos');
  
  for (const [nodeId, logo] of Object.entries(logoMap)) {
    const brandDir = path.join(baseDir, logo.brand);
    const typeDir = path.join(brandDir, logo.type);
    
    // Create directories
    fs.mkdirSync(typeDir, { recursive: true });
    
    if (logo.assets.length > 0) {
      const fileName = `${logo.color}.svg`;
      const filePath = path.join(typeDir, fileName);
      
      try {
        if (logo.combine && logo.assets.length > 1) {
          // Download all assets and combine them
          console.log(`Downloading and combining ${logo.brand} ${logo.type} ${logo.color} (${logo.assets.length} parts)...`);
          const svgContents = await Promise.all(
            logo.assets.map(url => downloadFile(url))
          );
          const combinedSVG = combineSVGs(svgContents);
          fs.writeFileSync(filePath, combinedSVG);
          console.log(`✓ Combined and saved to ${filePath}`);
        } else {
          // Single asset - download directly
          console.log(`Downloading ${logo.brand} ${logo.type} ${logo.color}...`);
          const svgContent = await downloadFile(logo.assets[0]);
          fs.writeFileSync(filePath, svgContent);
          console.log(`✓ Saved to ${filePath}`);
        }
      } catch (error) {
        console.error(`✗ Failed to process ${logo.brand} ${logo.type} ${logo.color}:`, error.message);
      }
    } else {
      console.log(`⚠ No assets defined for ${logo.brand} ${logo.type} ${logo.color}`);
    }
  }
  
  console.log('\n✓ Logo extraction complete!');
}

// Run the extraction
extractLogos().catch(console.error);
