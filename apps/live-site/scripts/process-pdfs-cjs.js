/**
 * Process PDF Reports (CommonJS version for pdf-parse compatibility)
 * 
 * Run: node scripts/process-pdfs-cjs.js
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

// Import OpenAI
const OpenAI = require('openai').default || require('openai');
const openai = new OpenAI({ apiKey: openaiApiKey });

async function extractPDFText(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error(`Error extracting PDF: ${error.message}`);
    return '';
  }
}

async function parseReportWithAI(text, fileName) {
  const limitedContent = text.length > 30000
    ? text.substring(0, 25000) + '\n\n[... content truncated ...]\n\n' + text.substring(text.length - 5000)
    : text;

  const category = fileName.toLowerCase().includes('voc') || fileName.toLowerCase().includes('voice')
    ? 'voc'
    : fileName.toLowerCase().includes('survey')
    ? 'survey'
    : fileName.toLowerCase().includes('design')
    ? 'design'
    : fileName.toLowerCase().includes('marketing')
    ? 'marketing'
    : 'research';

  const prompt = `You are analyzing a research report: "${fileName}"

Extract ALL structured insights from the following report content:

${limitedContent}

Extract:
1. **Title**: Clear, descriptive title
2. **Summary**: Overall summary
3. **Key Findings**: List ALL key findings, insights, metrics, percentages, statistics
4. **Recommendations**: Any recommendations or action items
5. **Themes**: Recurring themes, patterns, topics
6. **Findings with Severity**: Convert insights into structured findings with severity (critical, high, medium, low)
7. **Metadata**: Date, respondents, response rate, methodology

Return JSON format with: title, summary, keyFindings (array), recommendations (array), themes (array), findings (array with issue, severity, description, recommendation, affectedArea), metadata (object).`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a research analyst. Always return valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return { ...parsed, category };
  } catch (error) {
    console.error('AI parsing error:', error.message);
    return null;
  }
}

async function processReport(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📄 Processing: ${fileName}`);

  const text = await extractPDFText(filePath);
  if (!text || text.length < 100) {
    console.error(`⚠️  Could not extract text from ${fileName}`);
    return false;
  }

  console.log(`  ✅ Extracted ${text.length} characters`);

  const insight = await parseReportWithAI(text, fileName);
  if (!insight) {
    console.error(`❌ Failed to parse ${fileName}`);
    return false;
  }

  console.log(`  ✅ Parsed: ${insight.keyFindings?.length || 0} key findings, ${insight.findings?.length || 0} structured findings`);

  // Store via API (or directly to Supabase if needed)
  const report = {
    id: `report-${fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    source: 'Research Report',
    sourceUrl: `/reports/${fileName}`,
    title: insight.title || fileName,
    date: insight.metadata?.date || new Date().toISOString().split('T')[0],
    summary: insight.summary,
    findings: insight.findings || [],
    themes: insight.themes,
    priority: 'medium',
  };

  try {
    const response = await fetch('http://localhost:3000/api/ux-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manual: true, reportData: report }),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`  ✅ Stored in knowledge base: ${report.findings.length} findings`);
      return true;
    } else {
      console.error(`  ❌ Failed to store: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ API error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Processing PDF reports...\n');

  const reportsDir = path.join(__dirname, '..', 'public', 'reports');
  if (!fs.existsSync(reportsDir)) {
    console.error(`❌ Reports directory not found: ${reportsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(reportsDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`📚 Found ${files.length} PDF reports\n`);

  let processed = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(reportsDir, file);
    const success = await processReport(filePath);
    
    if (success) {
      processed++;
    } else {
      failed++;
    }

    // Small delay between files
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Complete! Processed: ${processed}, Failed: ${failed}`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
