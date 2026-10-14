/**
 * Google Web Search Crawler
 * 
 * Searches Google for articles, reviews, news, blog posts, and any content related to a website
 * Uses Google Custom Search API and OpenAI to analyze and extract insights
 */

import OpenAI from 'openai'
import { UXReport } from '@/lib/agent/knowledgeBase'

interface GoogleSearchSummary {
  source: string
  overallRating?: number
  totalReviews?: number
  themes: string[]
  findings: UXReport['findings']
  summary: string
  articleCount?: number
  contentTypes?: string[] // e.g., "reviews", "articles", "news", "blog posts"
}

/**
 * Search Google for articles, reviews, news, and any content about a website
 * Analyzes the content to extract UX insights, user feedback, brand mentions, etc.
 */
export async function crawlGoogleReviews(
  websiteUrl: string,
  googleApiKey: string,
  googleCseId: string,
  openaiApiKey: string
): Promise<GoogleSearchSummary | null> {
  try {
    const openai = new OpenAI({ apiKey: openaiApiKey })

    // Extract domain and site name
    const domain = new URL(websiteUrl).hostname.replace('www.', '')
    const siteName = domain.split('.')[0] // e.g., "betonline" from "betonline.ag"
    
    // Multiple search queries to get comprehensive coverage
    const searchQueries = [
      `"${domain}" OR "${siteName}" reviews`,
      `"${domain}" OR "${siteName}" articles`,
      `"${domain}" OR "${siteName}" news`,
      `"${domain}" OR "${siteName}" blog`,
      `"${domain}" OR "${siteName}" user feedback`,
      `"${domain}" OR "${siteName}" experience`,
    ]
    
    const allSnippets: Array<{ snippet: string; title: string; link: string; type: string }> = []
    
    // Search with multiple queries (limit to first 4 to avoid rate limits)
    for (let i = 0; i < Math.min(4, searchQueries.length); i++) {
      const searchQuery = searchQueries[i]
      console.log(`Searching Google (${i + 1}/${Math.min(4, searchQueries.length)}): ${searchQuery}`)
      
      try {
        const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCseId}&q=${encodeURIComponent(searchQuery)}&num=10`
        const searchResponse = await fetch(googleSearchUrl)
        
        if (!searchResponse.ok) {
          console.error(`Google Search API error: ${searchResponse.status} ${searchResponse.statusText}`)
          continue
        }
        
        const searchData = await searchResponse.json()
        
        searchData.items?.forEach((item: any) => {
          if (item.snippet || item.title) {
            allSnippets.push({
              snippet: item.snippet || item.title || '',
              title: item.title || '',
              link: item.link || '',
              type: i === 0 ? 'reviews' : i === 1 ? 'articles' : i === 2 ? 'news' : 'blog',
            })
          }
        })
        
        // Small delay to avoid rate limiting
        if (i < Math.min(4, searchQueries.length) - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (queryError: any) {
        console.error(`Error searching for "${searchQuery}":`, queryError.message)
        // Continue with next query
        continue
      }
    }

    if (allSnippets.length === 0) {
      console.log('No content found on Google for this website.')
      return null
    }
    
    console.log(`Found ${allSnippets.length} search results from Google`)

    // Step 2: Use OpenAI to analyze and extract insights from all content
    const contentText = allSnippets.map((item, idx) => 
      `[${item.type.toUpperCase()}] ${item.title}\n${item.snippet}\nSource: ${item.link}`
    ).join('\n\n---\n\n').substring(0, 12000) // Increased limit for more content
    
    const prompt = `You are a UX expert and brand analyst analyzing web content about ${websiteUrl}.
You have gathered articles, reviews, news, blog posts, and user feedback from Google search results.

Analyze this content to extract:
1. UX findings (issues, severity, recommendations, affected areas)
2. User sentiment and feedback themes
3. Brand mentions and reputation insights
4. Common complaints or praises
5. Overall summary of what people are saying about this website

Content from Google Search:
${contentText}

Extract:
1.  **Overall Summary**: A comprehensive summary of what people are saying about the website (reviews, articles, news, etc.).
2.  **Overall Rating**: An estimated average rating (e.g., 3.5/5) if discernible from reviews.
3.  **Total Reviews**: An estimated total number of reviews if discernible.
4.  **Content Types Found**: List the types of content found (e.g., ["reviews", "articles", "news", "blog posts"]).
5.  **Article/Content Count**: Approximate number of articles/pieces of content analyzed.
6.  **Key Themes**: A list of recurring themes from all content (e.g., "slow payouts", "great customer service", "confusing navigation", "security concerns", "bonus offers").
7.  **UX Findings**: A list of specific UX problems and insights. For each finding:
    -   **Issue**: A concise title for the problem or insight.
    -   **Severity**: (critical, high, medium, low) based on user impact and frequency.
    -   **Description**: Detailed explanation from the content analyzed.
    -   **Recommendation**: Suggested improvement based on UX best practices.
    -   **Affected Area**: (e.g., Navigation, Payment, Support, Performance, Security, General)

Return the data in this JSON format:
{
  "source": "Google Web Search",
  "overallRating": 3.8,
  "totalReviews": 150,
  "articleCount": 25,
  "contentTypes": ["reviews", "articles", "news", "blog posts"],
  "themes": ["slow payouts", "good game selection", "customer support issues", "security features", "bonus offers"],
  "findings": [
    {
      "issue": "Slow withdrawal process",
      "severity": "high",
      "description": "Multiple users and articles mention delays in receiving winnings, causing frustration and trust issues.",
      "recommendation": "Streamline the withdrawal verification process and provide clearer communication on timelines.",
      "affectedArea": "Payment"
    },
    {
      "issue": "Positive brand reputation for game variety",
      "severity": "low",
      "description": "Articles and reviews consistently praise the wide selection of games and betting options.",
      "recommendation": "Continue to highlight game variety in marketing materials.",
      "affectedArea": "General"
    }
  ],
  "summary": "Overall sentiment is mixed. Users appreciate the game selection and variety, but express frustration with slow payouts and occasional customer support issues. Security features are generally well-regarded."
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a UX expert and brand analyst analyzing web content (articles, reviews, news, blog posts) about websites. Extract structured insights, UX findings, and user sentiment. Always return valid JSON.',
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
      ...parsed,
      source: parsed.source || 'Google Web Search',
      articleCount: parsed.articleCount || allSnippets.length,
      contentTypes: parsed.contentTypes || ['reviews', 'articles', 'news'],
    } as GoogleSearchSummary
  } catch (error) {
    console.error('Google web search crawling error:', error)
    return null
  }
}
