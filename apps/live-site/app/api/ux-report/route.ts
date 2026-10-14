import { NextResponse } from 'next/server'
import { UXReport } from '@/lib/agent/knowledgeBase'
import { scrapeJurniiReport, parseReportWithAI } from '@/lib/utils/jurniiScraper'
import { analyzeWebsite } from '@/lib/utils/websiteAnalyzer'
import { crawlGoogleReviews } from '@/lib/utils/googleReviewsCrawler'
import { processAllReports } from '@/lib/utils/reportExtractor'
import { compareJurniiReports, formatComparison } from '@/lib/utils/jurniiComparison'
import { getUXReports, addUXReport as addUXReportToSupabase } from '@/lib/supabase/knowledgeBase'

/**
 * API endpoint to add UX reports to the knowledge base
 * Can accept manual reports or attempt to scrape from URLs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, reportData, manual, analyzeWebsite: shouldAnalyzeWebsite, crawlGoogleReviews: shouldCrawlGoogleReviews, processPDFs, compareWithPrevious } = body

    // If user wants to process all PDFs from public/reports/
    if (processPDFs) {
      const openaiApiKey = process.env.OPENAI_API_KEY
      if (!openaiApiKey) {
        return NextResponse.json({
          success: false,
          error: 'OPENAI_API_KEY not configured',
        }, { status: 400 })
      }

      const results = await processAllReports(openaiApiKey)
      return NextResponse.json({
        success: true,
        message: `Processed ${results.processed} reports, ${results.failed} failed`,
        results,
      })
    }

    // If manual report data is provided, add it directly
    if (manual && reportData) {
      const report: UXReport = {
        id: reportData.id || `ux-${Date.now()}`,
        source: reportData.source || 'Manual',
        sourceUrl: reportData.sourceUrl || url,
        title: reportData.title || 'UX Report',
        date: reportData.date || new Date().toISOString().split('T')[0],
        findings: reportData.findings || [],
        summary: reportData.summary,
        priority: reportData.priority,
      }

      await addUXReportToSupabase(report)

      return NextResponse.json({
        success: true,
        message: 'UX report added to knowledge base',
        reportId: report.id,
      })
    }

    // If URL is provided, attempt to extract data
    if (url) {
      // Check if credentials are available
      const jurniiEmail = process.env.JURNII_EMAIL
      const jurniiPassword = process.env.JURNII_PASSWORD
      const openaiApiKey = process.env.OPENAI_API_KEY
      const googleApiKey = process.env.GOOGLE_API_KEY
      const googleCseId = process.env.GOOGLE_CSE_ID

      // If it's a website URL and user wants analysis, analyze it as a UX expert
      if (shouldAnalyzeWebsite && openaiApiKey && !url.includes('jurnii.io')) {
        try {
          console.log(`Analyzing website: ${url}`)
          const analysis = await analyzeWebsite(url, openaiApiKey)
          
          if (analysis && analysis.findings && analysis.findings.length > 0) {
            const report: UXReport = {
              id: `website-${Date.now()}`,
              source: 'Website Analysis',
              sourceUrl: url,
              title: analysis.title,
              date: analysis.date,
              findings: analysis.findings.map((f: any) => ({
                issue: f.issue,
                severity: f.severity,
                description: f.description,
                recommendation: f.recommendation,
                affectedArea: f.affectedArea || 'General',
              })),
              summary: analysis.summary,
              priority: 'high',
            }

            await addUXReportToSupabase(report)

            return NextResponse.json({
              success: true,
              message: 'Website analyzed and UX findings added to knowledge base',
              reportId: report.id,
              findingsCount: report.findings.length,
              strengths: analysis.strengths || [],
            })
          }
        } catch (websiteError: any) {
          console.error('Website analysis failed:', websiteError)
          return NextResponse.json({
            success: false,
            error: `Website analysis failed: ${websiteError.message}`,
          }, { status: 500 })
        }
      }

      // If it's a Jurnii URL and credentials are available, try to scrape
      if (url.includes('jurnii.io') && jurniiEmail && jurniiPassword) {
        try {
          console.log('Attempting to scrape Jurnii report with authentication...')
          
          // Attempt to scrape the report
          const scrapedData = await scrapeJurniiReport(url, {
            email: jurniiEmail,
            password: jurniiPassword,
          })

          // Always try AI parsing if OpenAI key is available (more reliable)
          if (openaiApiKey) {
            try {
              // Use the scraped data's raw HTML if available
              let html = ''
              if ((scrapedData as any)?._rawHtml) {
                html = (scrapedData as any)._rawHtml
                console.log(`Using raw HTML from scraper: ${html.length} characters`)
              } else {
                console.log('No raw HTML available from scraper')
              }
              
              if (html && html.length > 100) {
                console.log('Starting AI parsing of HTML...')
                const aiParsed = await parseReportWithAI(html, openaiApiKey)
                console.log(`AI parsing result: ${aiParsed ? 'success' : 'failed'}`)
                if (aiParsed) {
                  console.log(`Found ${aiParsed.findings?.length || 0} findings`)
                }
            
                if (aiParsed && aiParsed.findings && aiParsed.findings.length > 0) {
                  const report: UXReport = {
                    id: `jurnii-${Date.now()}`,
                    source: 'Jurnii',
                    sourceUrl: url,
                    title: aiParsed.title || 'UX Report from Jurnii',
                    date: aiParsed.date || new Date().toISOString().split('T')[0],
                    executiveSummary: aiParsed.executiveSummary,
                    perception: aiParsed.perception,
                    journey: aiParsed.journey,
                    trends: aiParsed.trends,
                    performance: aiParsed.performance,
                    checking: aiParsed.checking,
                    competitorScores: aiParsed.competitorScores || [],
                    findings: aiParsed.findings.map(f => ({
                      issue: f.issue,
                      severity: f.severity,
                      description: f.description,
                      recommendation: f.recommendation,
                      affectedArea: f.affectedArea,
                      section: f.section,
                    })),
                    summary: aiParsed.summary || aiParsed.executiveSummary,
                    priority: 'high', // Default, can be adjusted
                  }

                  // If compareWithPrevious is true, find and compare with previous report
                  let comparison = null
                  if (compareWithPrevious) {
                    try {
                      const previousReports = await getUXReports()
                      // Find the most recent Jurnii report with the same URL (or similar title)
                      const previousReport = previousReports
                        .filter(r => r.source === 'Jurnii' && r.id !== report.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                      
                      if (previousReport) {
                        comparison = compareJurniiReports(previousReport, report)
                        console.log('📊 Report comparison:', comparison.summary)
                      } else {
                        console.log('ℹ️  No previous report found for comparison')
                      }
                    } catch (compareError) {
                      console.error('Comparison error:', compareError)
                    }
                  }

                  await addUXReportToSupabase(report)

                  return NextResponse.json({
                    success: true,
                    message: 'UX report extracted and added to knowledge base using AI parsing',
                    reportId: report.id,
                    findingsCount: report.findings.length,
                    comparison: comparison ? {
                      summary: comparison.summary,
                      newFindings: comparison.newFindings.length,
                      removedFindings: comparison.removedFindings.length,
                      updatedFindings: comparison.updatedFindings.length,
                      newCompetitorScores: comparison.newCompetitorScores?.length || 0,
                      updatedCompetitorScores: comparison.updatedCompetitorScores.length,
                      formatted: formatComparison(comparison),
                      full: comparison,
                    } : null,
                  })
                }
              }
            } catch (aiError: any) {
              console.error('AI parsing failed:', aiError)
              // Fall through to try scraped data
            }
          }

          // Fallback: Use scraped data if available
          if (scrapedData && scrapedData.findings && scrapedData.findings.length > 0) {
            const report: UXReport = {
              id: `jurnii-${Date.now()}`,
              source: 'Jurnii',
              sourceUrl: url,
              title: scrapedData.title || 'UX Report from Jurnii',
              date: scrapedData.date || new Date().toISOString().split('T')[0],
              findings: scrapedData.findings,
              summary: scrapedData.summary,
              priority: 'high',
            }

            await addUXReportToSupabase(report)

            return NextResponse.json({
              success: true,
              message: 'UX report extracted and added to knowledge base',
              reportId: report.id,
              findingsCount: report.findings.length,
            })
          }
        } catch (error: any) {
          console.error('Jurnii scraping failed:', error)
          // Fall through to manual instructions
        }
      }

      // --- 3. Google Web Search (articles, reviews, news, etc.) (if requested) ---
      if (shouldCrawlGoogleReviews && openaiApiKey && googleApiKey && googleCseId) {
        try {
          console.log(`Searching Google for articles, reviews, and content about: ${url}`)
          const searchSummary = await crawlGoogleReviews(url, googleApiKey, googleCseId, openaiApiKey)

          if (searchSummary) {
            const report: UXReport = {
              id: `google-search-${Date.now()}`,
              source: searchSummary.source || 'Google Web Search',
              sourceUrl: url,
              title: `Web Content Analysis for ${new URL(url).hostname}`,
              date: new Date().toISOString().split('T')[0],
              findings: searchSummary.findings.map(f => ({
                issue: f.issue,
                severity: f.severity,
                description: f.description,
                recommendation: f.recommendation,
                affectedArea: f.affectedArea,
              })),
              summary: searchSummary.summary,
              priority: 'medium', // Default priority for web content
              overallRating: searchSummary.overallRating,
              totalReviews: searchSummary.totalReviews,
              themes: searchSummary.themes,
            }
            await addUXReportToSupabase(report)
            return NextResponse.json({
              success: true,
              message: 'Google web search completed and insights added to knowledge base',
              reportId: report.id,
              findingsCount: report.findings.length,
              overallRating: report.overallRating,
              totalReviews: report.totalReviews,
              articleCount: searchSummary.articleCount,
              contentTypes: searchSummary.contentTypes,
            })
          }
        } catch (reviewError: any) {
          console.error('Google web search failed:', reviewError)
          return NextResponse.json({
            success: false,
            error: `Google web search failed: ${reviewError.message}`,
          }, { status: 500 })
        }
      }

      // If scraping failed or credentials not available, return instructions
      return NextResponse.json({
        success: false,
        message: url.includes('jurnii.io') 
          ? 'Jurnii extraction requires credentials. Set JURNII_EMAIL and JURNII_PASSWORD environment variables, or use manual input.'
          : 'Automatic extraction not available for this URL. Please use manual input.',
        instructions: {
          step1: 'Visit the report URL',
          step2: 'Copy the report findings',
          step3: 'Use the manual input format below',
          manualFormat: {
            id: 'jurnii-001',
            source: 'Jurnii',
            sourceUrl: url,
            title: 'UX Report - Site Improvements',
            date: '2024-01-15',
            findings: [
              {
                issue: 'Issue title',
                severity: 'high',
                description: 'Detailed description',
                recommendation: 'Recommended solution',
                affectedArea: 'Navigation',
              },
            ],
            summary: 'Overall summary',
            priority: 'high',
          },
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Either url or manual reportData must be provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('UX Report API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process UX report' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to retrieve all UX reports
 */
export async function GET() {
  try {
    // Try Supabase first, then fallback to in-memory
    let reports: UXReport[] = []
    
    // Fallback to in-memory knowledge base
    // Supabase integration can be added later if needed
    const { knowledgeBase } = await import('@/lib/agent/knowledgeBase')
    reports = knowledgeBase.uxReports
    
    return NextResponse.json({
      success: true,
      reports,
      count: reports.length,
    })
  } catch (error) {
    console.error('UX Report GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve UX reports' },
      { status: 500 }
    )
  }
}
