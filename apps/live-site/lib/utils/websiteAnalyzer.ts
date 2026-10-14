/**
 * Website UX Analyzer
 * 
 * Analyzes websites as a UX expert using OpenAI
 * Extracts UX findings, recommendations, and insights
 */

interface WebsiteAnalysis {
  url: string
  title: string
  findings: Array<{
    issue: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    recommendation?: string
    affectedArea?: string
    category?: 'Navigation' | 'Performance' | 'Accessibility' | 'Design' | 'Content' | 'Functionality'
  }>
  summary: string
  strengths?: string[]
  date: string
}

/**
 * Analyze a website URL as a UX expert
 * Uses OpenAI to analyze the website structure, content, and provide UX insights
 */
export async function analyzeWebsite(
  url: string,
  openaiApiKey?: string
): Promise<WebsiteAnalysis | null> {
  if (!openaiApiKey) {
    console.log('OpenAI API key not provided, cannot analyze website')
    return null
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Fetch the website HTML
    console.log(`Fetching website: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebsiteUXAnalyzer/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`Fetched ${html.length} characters from ${url}`)

    // Extract text content (remove scripts, styles, etc.)
    const textContent = extractTextContent(html)
    const limitedContent = textContent.substring(0, 12000) // Limit for token efficiency

    const prompt = `You are an expert UX analyst analyzing a gambling/casino website. Analyze the following website content and provide comprehensive UX insights.

Website URL: ${url}
Website Content (first 12000 chars):
${limitedContent}

Analyze this website as a UX expert and identify:
1. **Navigation & Information Architecture**: How easy is it to find information? Is the navigation clear?
2. **Visual Design & Branding**: Is the design consistent? Does it align with gambling industry standards?
3. **Performance & Usability**: Are there any obvious usability issues? Loading times, responsiveness?
4. **Content & Messaging**: Is the content clear? Are CTAs prominent?
5. **Accessibility**: Any obvious accessibility issues?
6. **Mobile Experience**: How would this work on mobile? (infer from structure)
7. **Trust & Credibility**: Does the site build trust? Security indicators?
8. **Conversion Optimization**: Are there barriers to conversion?

For each finding, provide:
- Issue title (clear and specific)
- Severity: critical (blocks core functionality), high (major UX issue), medium (moderate issue), low (minor improvement)
- Description (detailed explanation)
- Recommendation (actionable solution)
- Affected Area: Navigation, Casino, Sports, Authentication, Payment, General, etc.
- Category: Navigation, Performance, Accessibility, Design, Content, Functionality

Also identify:
- Key strengths (what works well)
- Overall summary

Return the data in this JSON format:
{
  "title": "UX Analysis: [Website Name]",
  "findings": [
    {
      "issue": "Clear, specific issue title",
      "severity": "high",
      "description": "Detailed description of the UX issue",
      "recommendation": "Actionable recommendation to fix",
      "affectedArea": "Navigation",
      "category": "Navigation"
    }
  ],
  "summary": "Overall UX assessment and key takeaways",
  "strengths": ["Strength 1", "Strength 2"],
  "date": "2024-12-13"
}

Be thorough and identify at least 5-10 findings. Focus on actionable, specific issues.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX analyst specializing in online gambling and casino websites. You provide detailed, actionable UX insights based on website analysis. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(responseText)
    
    return {
      url,
      title: parsed.title || `UX Analysis: ${url}`,
      findings: parsed.findings || [],
      summary: parsed.summary || 'UX analysis completed',
      strengths: parsed.strengths || [],
      date: parsed.date || new Date().toISOString().split('T')[0],
    }
  } catch (error: any) {
    console.error('Website analysis error:', error)
    return null
  }
}

/**
 * Extract readable text content from HTML
 */
function extractTextContent(html: string): string {
  // Remove scripts and styles
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
  
  // Extract text from common elements
  const textMatches = text.match(/<[^>]+>([^<]+)<\/[^>]+>/g) || []
  const extractedText = textMatches
    .map(match => {
      const textMatch = match.match(/<[^>]+>([^<]+)<\/[^>]+>/)
      return textMatch ? textMatch[1].trim() : ''
    })
    .filter(t => t.length > 10) // Only keep substantial text
    .join(' ')
  
  // Also get meta descriptions, titles, etc.
  const metaDescription = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || ''
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || ''
  
  return `${title}\n${metaDescription}\n${extractedText}`.trim()
}
