/**
 * Research Report Extractor
 * 
 * Extracts and processes PDF research reports from public/reports/
 * Uses OpenAI to extract structured insights and findings
 */

import fs from 'fs'
import path from 'path'
import { UXReport } from '@/lib/agent/knowledgeBase'
import { addUXReport as addUXReportToSupabase } from '@/lib/supabase/knowledgeBase'

// Note: pdf-parse is a CommonJS module, we'll use dynamic require

interface ReportInsight {
  title: string
  category: 'survey' | 'voc' | 'design' | 'marketing' | 'research'
  summary: string
  keyFindings: string[]
  recommendations?: string[]
  themes?: string[]
  findings?: Array<{
    issue: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    recommendation?: string
    affectedArea?: string
  }>
  metadata?: {
    date?: string
    respondents?: number
    responseRate?: string
    methodology?: string
  }
}

/**
 * Extract text from PDF file
 */
async function extractPDFText(filePath: string): Promise<string> {
  try {
    // pdf-parse is a CommonJS module - use dynamic require
    // We need to use a CommonJS wrapper since pdf-parse doesn't work well with ESM
    const pdfParseModule = await import('pdf-parse') as any
    const pdfParse = pdfParseModule.default || (() => {
      // Fallback: create a CommonJS require in Node.js
      const { createRequire } = require('module')
      const require2 = createRequire(import.meta.url || __filename)
      return require2('pdf-parse')
    })()
    
    const dataBuffer = fs.readFileSync(filePath)
    
    // pdf-parse can be called directly or might need to be accessed differently
    let data
    if (typeof pdfParse === 'function') {
      data = await pdfParse(dataBuffer)
    } else {
      // If it's an object, try to find the parse function
      const parseFn = pdfParse.default || pdfParse.pdfParse || pdfParse
      data = await parseFn(dataBuffer)
    }
    
    return data.text || ''
  } catch (error: any) {
    console.error(`Error extracting PDF text from ${filePath}:`, error.message)
    
    // Fallback: Try using CommonJS require directly (for Node.js runtime)
    try {
      // Use eval to work around ESM restrictions - this is safe here as we control the input
      const requireFunc = eval('require')
      const pdfParse = requireFunc('pdf-parse')
      const dataBuffer = fs.readFileSync(filePath)
      
      let data
      if (typeof pdfParse === 'function') {
        data = await pdfParse(dataBuffer)
      } else if (pdfParse.default) {
        data = await pdfParse.default(dataBuffer)
      } else {
        // Try calling it anyway
        data = await pdfParse(dataBuffer)
      }
      
      return data.text || ''
    } catch (fallbackError: any) {
      console.error(`Fallback PDF extraction failed:`, fallbackError.message)
      return ''
    }
  }
}

/**
 * Parse report content with AI to extract structured insights
 */
async function parseReportWithAI(
  text: string,
  fileName: string,
  openaiApiKey?: string
): Promise<ReportInsight | null> {
  if (!openaiApiKey) {
    console.log('OpenAI API key not provided, cannot parse report with AI')
    return null
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Extract FULL PDF content - gpt-4o supports 128k tokens (~500k chars), so we can process entire PDFs
    // Only truncate if absolutely necessary (very rare for survey PDFs)
    const maxContentLength = 400000 // 400k chars - should handle even very large PDFs
    const limitedContent = text.length > maxContentLength
      ? text.substring(0, 380000) + '\n\n[... middle content truncated for processing ...]\n\n' + text.substring(text.length - 20000)
      : text
    
    console.log(`📄 Processing FULL PDF: ${text.length} characters extracted (${limitedContent.length} chars sent to AI)`)

    // Determine category from filename
    const category = fileName.toLowerCase().includes('voc') || fileName.toLowerCase().includes('voice')
      ? 'voc'
      : fileName.toLowerCase().includes('survey')
      ? 'survey'
      : fileName.toLowerCase().includes('design')
      ? 'design'
      : fileName.toLowerCase().includes('marketing')
      ? 'marketing'
      : 'research'

    const prompt = `You are analyzing a comprehensive research report: "${fileName}"

Extract ALL structured insights from the following FULL report content. This is the COMPLETE report - extract EVERYTHING from every page:

${limitedContent}

CRITICAL INSTRUCTIONS - Extract EVERYTHING from the ENTIRE document:
1. **Title**: Clear, descriptive title for this report
2. **Summary**: Comprehensive overall summary covering the report's purpose, methodology, scope, and ALL main findings from the entire document
3. **Key Findings**: This is THE MOST IMPORTANT section. List EVERY single key finding, insight, metric, percentage, statistic, competitor name, user quote, data point, and piece of valuable information from the ENTIRE report. Do NOT summarize - list EVERYTHING:
   - **ALL Competitor names** mentioned anywhere in the document (e.g., "Stake", "DraftKings", "FanDuel", "BetMGM", "Caesars", "Bet365", "Fanatics", etc.) - search the ENTIRE document thoroughly
   - **ALL Statistics, percentages, metrics** from every section (e.g., "75% of users", "3.8/5 rating", "150 responses", "45% increase", "Q1 2025 data", "67% satisfaction")
   - **ALL User feedback, quotes, or comments** from survey respondents - include actual quotes when present, include ALL feedback
   - **ALL Market insights and trends** mentioned anywhere in the report
   - **ALL Specific numbers, dates, or data points** throughout the entire document
   - **ALL Insights about user behavior, preferences, pain points, satisfaction levels** from all sections
   - **ALL Comparison data** between competitors, over time, or between segments
   - **ALL Survey responses, ratings, rankings, or scores** mentioned anywhere
   - **ALL Demographics, respondent information, or sample sizes**
   - **ALL Charts, graphs, or data visualizations described in text**
   - **EVERY piece of data that could be valuable** - be exhaustive, not selective. If the report has 100 pages, extract from all 100 pages.
4. **Recommendations**: ALL recommendations or action items from the entire report
5. **Themes**: ALL recurring themes, patterns, or topics across the entire report
6. **Findings with Severity**: Convert insights into structured findings with severity levels. Extract findings from EVERY section:
   - critical: Major issues that block goals or cause significant problems
   - high: Important issues that significantly impact user experience or business goals
   - medium: Moderate issues that should be addressed
   - low: Minor issues or enhancement opportunities
7. **Metadata**: Extract ALL metadata (date, number of respondents, response rate, methodology, survey period, etc.)

CRITICAL: The "keyFindings" array MUST contain HUNDREDS of items if the report is comprehensive. Extract EVERY statistic, competitor name, user quote, insight, and data point from the ENTIRE document. Do NOT summarize or condense - list EVERYTHING. Read through the ENTIRE document and extract from every section, every page, every chart, every table.

Return the data in this JSON format:
{
  "title": "Report title",
  "summary": "Overall summary",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...] (optional),
  "themes": ["Theme 1", "Theme 2", ...] (optional),
  "findings": [
    {
      "issue": "Clear issue title",
      "severity": "high",
      "description": "Detailed description",
      "recommendation": "Recommended solution" (optional),
      "affectedArea": "Casino, Sports, Marketing, etc." (optional)
    }
  ],
  "metadata": {
    "date": "2024-11-25" (if found),
    "respondents": 500 (if found),
    "responseRate": "75%" (if found),
    "methodology": "Online survey, focus groups, etc." (if found)
  }
}

Be thorough - extract ALL findings, statistics, insights, and data points. Convert every significant insight into a finding with appropriate severity.`

    // Use gpt-4o for larger context window and better extraction of comprehensive reports
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Use gpt-4o for larger context (128k tokens) and better extraction
      messages: [
        {
          role: 'system',
          content: 'You are a research analyst extracting structured insights from research reports. Be thorough and comprehensive. Extract EVERY piece of valuable information including competitor names, statistics, user quotes, metrics, and insights. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 16000, // Increased to capture more findings
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(responseText)

    return {
      title: parsed.title || fileName,
      category: category as any,
      summary: parsed.summary || '',
      keyFindings: parsed.keyFindings || [],
      recommendations: parsed.recommendations || [],
      themes: parsed.themes || [],
      findings: parsed.findings || [],
      metadata: parsed.metadata || {},
    }
  } catch (error) {
    console.error('AI parsing error:', error)
    return null
  }
}

/**
 * Process a single PDF report
 */
export async function processReport(
  filePath: string,
  openaiApiKey?: string
): Promise<boolean> {
  try {
    const fileName = path.basename(filePath)
    console.log(`📄 Processing report: ${fileName}`)

    // Extract text from PDF
    const text = await extractPDFText(filePath)
    if (!text || text.length < 100) {
      console.error(`⚠️  Could not extract meaningful text from ${fileName}`)
      return false
    }

    console.log(`✅ Extracted ${text.length} characters from ${fileName}`)

    // Parse with AI
    if (!openaiApiKey) {
      console.log(`⚠️  No OpenAI API key, cannot parse ${fileName} with AI`)
      return false
    }

    const insight = await parseReportWithAI(text, fileName, openaiApiKey)
    if (!insight) {
      console.error(`❌ Failed to parse ${fileName} with AI`)
      return false
    }

    console.log(`✅ Parsed ${fileName}: ${insight.keyFindings.length} key findings, ${insight.findings?.length || 0} structured findings`)

    // Store as UX Report if it has findings, otherwise as knowledge note
    if (insight.findings && insight.findings.length > 0) {
      // Store keyFindings in executiveSummary so it's accessible in knowledge base
      // keyFindings contains competitor names, statistics, and important insights
      const executiveSummaryWithKeyFindings = insight.keyFindings && insight.keyFindings.length > 0
        ? `Key Findings:\n${insight.keyFindings.map((kf, idx) => `${idx + 1}. ${kf}`).join('\n')}\n\n${insight.recommendations && insight.recommendations.length > 0 ? `Recommendations:\n${insight.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')}` : ''}`
        : undefined
      
      const report: UXReport = {
        id: `report-${fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        source: 'Research Report',
        sourceUrl: `/reports/${fileName}`,
        title: insight.title,
        date: insight.metadata?.date || new Date().toISOString().split('T')[0],
        summary: insight.summary,
        executiveSummary: executiveSummaryWithKeyFindings, // Store keyFindings here so it's in knowledge base
        findings: insight.findings,
        themes: insight.themes,
        priority: 'medium',
      }

      // Try Supabase first, fallback to in-memory
      const supabaseSuccess = await addUXReportToSupabase(report)
      if (!supabaseSuccess) {
        // Fallback to in-memory storage
        const { addUXReport } = await import('@/lib/agent/knowledgeBase')
        await addUXReport(report)
        console.log(`⚠️  Supabase not available, added ${fileName} to in-memory knowledge base`)
      } else {
        console.log(`✅ Added ${fileName} to Supabase: "${report.title}" (${report.source}) with ${report.findings.length} findings`)
      }
    }

    // Also store as knowledge note for comprehensive access (if function exists)
    try {
      const { addKnowledgeNote } = await import('@/lib/supabase/knowledgeBase-addon')
      const noteContent = JSON.stringify({
        category: insight.category,
        summary: insight.summary,
        keyFindings: insight.keyFindings,
        recommendations: insight.recommendations,
        themes: insight.themes,
        metadata: insight.metadata,
        findingsCount: insight.findings?.length || 0,
      }, null, 2)

      await addKnowledgeNote({
        title: insight.title,
        content: noteContent,
        category: insight.category,
        tags: ['research', 'report', insight.category, ...(insight.themes || []).map(t => t.toLowerCase().replace(/\s+/g, '-'))],
      })

      console.log(`✅ Added ${fileName} as knowledge note`)
    } catch (error: any) {
      console.log(`⚠️  Could not add knowledge note (function may not exist yet): ${error.message}`)
    }
    return true
  } catch (error: any) {
    console.error(`❌ Error processing report ${filePath}:`, error.message)
    return false
  }
}

/**
 * Process all reports in public/reports/
 */
export async function processAllReports(openaiApiKey?: string): Promise<{
  processed: number
  failed: number
  reports: string[]
}> {
  const reportsDir = path.join(process.cwd(), 'public', 'reports')
  
  if (!fs.existsSync(reportsDir)) {
    console.error(`❌ Reports directory not found: ${reportsDir}`)
    return { processed: 0, failed: 0, reports: [] }
  }

  const files = fs.readdirSync(reportsDir).filter(f => f.toLowerCase().endsWith('.pdf'))
  console.log(`📚 Found ${files.length} PDF reports in ${reportsDir}`)

  const results = {
    processed: 0,
    failed: 0,
    reports: [] as string[],
  }

  for (const file of files) {
    const filePath = path.join(reportsDir, file)
    const success = await processReport(filePath, openaiApiKey)
    
    if (success) {
      results.processed++
      results.reports.push(file)
    } else {
      results.failed++
    }

    // Small delay between files to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}
