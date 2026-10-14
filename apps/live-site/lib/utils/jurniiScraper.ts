/**
 * Jurnii UX Report Scraper
 * 
 * Securely authenticates and extracts UX report data from Jurnii
 * Uses environment variables for credentials
 */

interface JurniiCredentials {
  email: string
  password: string
}

interface JurniiReportData {
  title?: string
  executiveSummary?: string
  perception?: string | string[]
  journey?: string | Array<{
    step?: string
    finding?: string
    issue?: string
    insight?: string
  }>
  trends?: string | Array<{
    trend?: string
    description?: string
    impact?: string
  }>
  performance?: string | Array<{
    metric?: string
    value?: string
    insight?: string
    issue?: string
  }>
  checking?: string | Array<{
    check?: string
    finding?: string
    issue?: string
  }>
  competitorScores?: Array<{
    competitor: string
    category: string
    score: number
    ourScore?: number
    comparison?: string
  }>
  findings: Array<{
    issue: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    recommendation?: string
    affectedArea?: string
    section?: string // Which section this finding came from (executiveSummary, perception, journey, trends, performance, checking)
  }>
  summary?: string
  date?: string
}

/**
 * Authenticate with Jurnii and extract report data
 * 
 * Note: This requires the site to be accessible and may need to be adjusted
 * based on Jurnii's actual authentication flow
 */
export async function scrapeJurniiReport(
  reportUrl: string,
  credentials?: JurniiCredentials
): Promise<JurniiReportData | null> {
  try {
    let cookies = ''
    
    // If credentials are provided, authenticate first
    if (credentials) {
      console.log('Authenticating with Jurnii...')
      
      // Step 1: Get the login page to get any CSRF tokens or session cookies
      const loginPageResponse = await fetch('https://app.jurnii.io/login', {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DesignRequestApp/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
      
      // Extract cookies from login page response (compatible with Node.js and Vercel)
      const setCookieHeader = loginPageResponse.headers.get('set-cookie')
      if (setCookieHeader) {
        // Handle both single string and array of strings
        const cookieArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
        // Extract cookie name=value pairs (before semicolon)
        cookies = cookieArray
          .map(cookie => cookie.split(';')[0].trim())
          .join('; ')
      }
      
      // Step 2: POST to login endpoint
      // Jurnii uses NextAuth.js, so we need to use the correct endpoint
      // NextAuth.js credentials provider uses /api/auth/callback/credentials
      // We need to include CSRF token if present
      const loginPageHtml = await loginPageResponse.text()
      const csrfTokenMatch = loginPageHtml.match(/name="csrfToken"\s+value="([^"]+)"/) || 
                             loginPageHtml.match(/csrfToken["']?\s*[:=]\s*["']([^"']+)/)
      
      const loginBody = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
        redirect: 'false',
        json: 'true',
      })
      
      if (csrfTokenMatch) {
        loginBody.append('csrfToken', csrfTokenMatch[1])
      }
      
      const loginResponse = await fetch('https://app.jurnii.io/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (compatible; DesignRequestApp/1.0)',
          'Accept': 'application/json, text/html, */*',
          'Referer': 'https://app.jurnii.io/login',
          ...(cookies ? { 'Cookie': cookies } : {}),
        },
        body: loginBody.toString(),
        redirect: 'follow',
      })
      
      // Extract cookies from login response (compatible with Node.js and Vercel)
      const loginCookieHeader = loginResponse.headers.get('set-cookie')
      if (loginCookieHeader) {
        // Handle both single string and array of strings
        const cookieArray = Array.isArray(loginCookieHeader) ? loginCookieHeader : [loginCookieHeader]
        // Extract cookie name=value pairs (before semicolon)
        const newCookies = cookieArray
          .map(cookie => cookie.split(';')[0].trim())
          .join('; ')
        
        // Merge with existing cookies
        if (cookies) {
          cookies = `${cookies}; ${newCookies}`
        } else {
          cookies = newCookies
        }
      }
      
      // Check if login was successful
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text()
        console.error('Jurnii login failed:', loginResponse.status, errorText)
        throw new Error(`Authentication failed: ${loginResponse.status}`)
      }
      
      console.log('Jurnii authentication successful')
    }

    // Step 3: Fetch the report page with authenticated session
    // Make sure we use the authenticated cookies
    const fetchHeaders: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (compatible; DesignRequestApp/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Referer': 'https://app.jurnii.io/',
    }
    
    if (cookies) {
      fetchHeaders['Cookie'] = cookies
    }
    
    const response = await fetch(reportUrl, {
      method: 'GET',
      headers: fetchHeaders,
    })

    if (!response.ok) {
      // If we get 401/403, authentication is required
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required or session expired. Please check Jurnii credentials.')
      }
      throw new Error(`Failed to fetch report: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    
    // Return raw HTML for AI parsing (more reliable than manual parsing)
    return {
      title: 'UX Report from Jurnii',
      findings: [],
      summary: 'Report extracted from Jurnii',
      date: new Date().toISOString().split('T')[0],
      _rawHtml: html, // Include raw HTML for AI parsing
    } as any
  } catch (error: any) {
    console.error('Jurnii scraping error:', error)
    return null
  }
}

/**
 * Parse Jurnii HTML to extract structured report data
 */
function parseJurniiHTML(html: string, url: string): JurniiReportData {
  // This is a placeholder - actual parsing will depend on Jurnii's HTML structure
  // You may need to use a library like cheerio or jsdom for better HTML parsing
  
  const findings: JurniiReportData['findings'] = []
  
  // Extract title (adjust selector based on actual HTML)
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                     html.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : 'UX Report from Jurnii'
  
  // Extract findings (this will need to be customized)
  // Look for patterns in the HTML that indicate findings/issues
  
  // For now, return a basic structure
  // In production, you'd parse the actual HTML structure
  return {
    title,
    findings,
    summary: 'Extracted from Jurnii report',
    date: new Date().toISOString().split('T')[0],
  }
}

/**
 * Alternative: Use OpenAI to parse report data from HTML/text
 */
export async function parseReportWithAI(
  htmlOrText: string,
  openaiApiKey?: string
): Promise<JurniiReportData | null> {
  if (!openaiApiKey) {
    console.log('OpenAI API key not provided, cannot parse with AI')
    return null
  }

  try {
    const { default: OpenAI } = await import('openai')
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Increase HTML limit to capture full report - use up to 50000 chars (allows for comprehensive extraction)
    // Split into chunks if needed, but prioritize the beginning and key sections
    const fullContent = htmlOrText.length > 50000 
      ? htmlOrText.substring(0, 30000) + '\n\n[... middle content truncated ...]\n\n' + htmlOrText.substring(htmlOrText.length - 20000)
      : htmlOrText
    
    const prompt = `You are analyzing a comprehensive UX report from Jurnii (a competitor analysis tool). Extract ALL structured data from the following HTML content.

IMPORTANT: You must extract ALL sections of the report, including:

1. **Executive Summary** - Overall report summary, key insights, main findings
2. **Perception** - User perceptions, brand perception, customer sentiment
3. **Journey** - User journey analysis, journey stages, journey insights
4. **Trends** - Market trends, design trends, user behavior trends
5. **Performance** - Performance metrics, KPIs, performance issues
6. **Checking** - Quality checks, validation findings, compliance checks

Extract EVERY finding, insight, issue, and recommendation from ALL sections.

For each finding extracted, assign a severity:
- critical: Blocks core functionality or causes major user frustration
- high: Significant UX issue that impacts user experience
- medium: Moderate issue that could be improved
- low: Minor issue or enhancement opportunity

Also extract:
- Competitor names and comparisons
- **Competitor comparison scores** - Extract any scores, ratings, or rankings for competitors in different categories (Navigation, Mobile, Payment Options, User Experience, Performance, etc.). Format these as structured data when possible (e.g., "Stake: Navigation 8.5/10, Mobile 9/10, Payment 10/10")
- **Category-by-category comparisons** - Extract how each competitor performs in specific categories (Navigation, Mobile UX, Payment Options, User Experience, Performance, etc.)
- UX issues and pain points
- Recommendations and suggestions
- Areas affected (Casino, Sports, Navigation, Authentication, Cashier, etc.)
- Metrics, KPIs, and performance data
- User sentiment and perceptions
- Journey insights and stages
- Trends and patterns

Return the data in this JSON format:
{
  "title": "Report title from the page",
  "executiveSummary": "Full executive summary text - all key points and insights, competitor names, main findings, strategic recommendations",
  "perception": ["Perception point 1", "Perception point 2", ...] OR "Full perception text",
  "journey": ["Journey insight 1", "Journey insight 2", ...] OR "Full journey analysis text",
  "trends": ["Trend 1 with description", "Trend 2 with description", ...] OR "Full trends text",
  "performance": ["Performance metric 1: value and insight", "Performance metric 2: value and insight", ...] OR "Full performance text",
  "checking": ["Check finding 1", "Check finding 2", ...] OR "Full checking text",
  "competitorScores": [
    {
      "competitor": "Competitor Name (e.g., Stake, DraftKings)",
      "category": "Category Name (e.g., Mobile UX, Navigation, Payment Options)",
      "score": 9, // Score out of 10 (or as provided)
      "ourScore": 7, // Our score for comparison (if available)
      "comparison": "Qualitative comparison text (e.g., 'Stake excels here' or 'We need improvement')"
    }
  ],
  "findings": [
    {
      "issue": "Clear, descriptive issue title",
      "severity": "high",
      "description": "Detailed description of the finding",
      "recommendation": "Recommended solution or improvement",
      "affectedArea": "Navigation, Casino, Sports, etc. (or 'General' if not specific)",
      "section": "executiveSummary" OR "perception" OR "journey" OR "trends" OR "performance" OR "checking"
    }
  ],
  "summary": "Overall summary combining all sections",
  "date": "2024-12-13 (or today's date if not found)"
}

CRITICAL REQUIREMENTS:
1. Extract ALL content from ALL sections - especially the Executive Summary which contains key strategic insights, competitor names, and main findings
2. Convert every insight, finding, issue, trend, and metric into the findings array with appropriate severity
3. Include the section name in each finding so we know where it came from
4. Extract competitor scores and comparisons from the Executive Summary, Perception, Journey, and Performance sections - look for numerical scores (e.g., "9/10", "8.5/10") and category-by-category comparisons
5. The Executive Summary is critical - it should contain the full text with all key points, competitor names, strategic recommendations, and main findings

HTML Content:
${fullContent}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a UX analyst extracting structured data from UX reports. Extract EVERY finding, insight, issue, metric, trend, and recommendation from ALL sections. Be thorough and comprehensive. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000, // Increased to allow for more findings
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(responseText)
    
    return parsed as JurniiReportData
  } catch (error) {
    console.error('AI parsing error:', error)
    return null
  }
}
