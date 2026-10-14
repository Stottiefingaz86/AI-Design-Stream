'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { UXFindingsCard } from './UXFindingsCard'
import { ReviewSummaryCard } from './ReviewSummaryCard'
import { formatTextWithMarkups } from './TextWithMarkups'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  images?: string[] // Base64 encoded images or URLs
  generatedImage?: string // URL for AI-generated images
}

interface ColorSwatch {
  token: string
  hex: string
  description: string
  figmaLink?: string
}

interface TokenCopy {
  token: string
  value: string
  figmaLink?: string
}

interface LogoImage {
  brand: string
  type: string
  color: string
  figmaLink?: string
  downloadUrl?: string
}

// Parse color swatches from message content
function parseColorSwatches(content: string): { text: string; swatches: ColorSwatch[] } {
  const swatchRegex = /COLOR_SWATCH:([^:\n]+):([^:\n]+):([^:\n]*):?([^\n]*)/g
  const swatches: ColorSwatch[] = []
  let match
  
  // Debug: check if content contains COLOR_SWATCH
  if (content.includes('COLOR_SWATCH')) {
    console.log('Found COLOR_SWATCH in content:', content.match(/COLOR_SWATCH:[^\n]+/g))
  }
  
  // Reset regex lastIndex
  swatchRegex.lastIndex = 0
  
  while ((match = swatchRegex.exec(content)) !== null) {
    const swatch = {
      token: match[1],
      hex: match[2],
      description: match[3] || '',
      figmaLink: match[4]?.trim() || undefined,
    }
    console.log('Parsed color swatch:', swatch)
    swatches.push(swatch)
  }
  
  // Remove COLOR_SWATCH markers from text
  const text = content.replace(/COLOR_SWATCH:[^\n]+/g, '').trim()
  
  return { text, swatches }
}

// Parse token copy blocks from message content
function parseTokenCopies(content: string): { text: string; tokens: TokenCopy[] } {
  const tokenRegex = /TOKEN_COPY:([^:\n]+):([^:\n]+):?([^\n]*)/g
  const tokens: TokenCopy[] = []
  let match
  
  while ((match = tokenRegex.exec(content)) !== null) {
    tokens.push({
      token: match[1],
      value: match[2],
      figmaLink: match[3]?.trim() || undefined,
    })
  }
  
  // Remove TOKEN_COPY markers from text
  const text = content.replace(tokenRegex, '').trim()
  
  return { text, tokens }
}

// Parse logo images from message content
function parseLogoImages(content: string): { text: string; logos: LogoImage[] } {
  // Format: LOGO_IMAGE:brand:type:color:figmaLink:downloadUrl
  // URLs contain colons, so we need to parse manually
  const logoLines = content.split('\n').filter(line => line.startsWith('LOGO_IMAGE:'))
  const logos: LogoImage[] = []
  
  // Debug: check if content contains LOGO_IMAGE
  if (logoLines.length > 0) {
    console.log('Found LOGO_IMAGE lines:', logoLines)
  }
  
  logoLines.forEach(line => {
    // Remove "LOGO_IMAGE:" prefix
    const rest = line.substring('LOGO_IMAGE:'.length)
    
    // We know the format is: brand:type:color:figmaLink:downloadUrl
    // But URLs contain ://, so we need a smarter approach
    // Strategy: Find the first 3 colons (for brand, type, color), then handle the rest
    
    const firstColon = rest.indexOf(':')
    if (firstColon === -1) return
    
    const secondColon = rest.indexOf(':', firstColon + 1)
    if (secondColon === -1) return
    
    const thirdColon = rest.indexOf(':', secondColon + 1)
    if (thirdColon === -1) return
    
    const brand = rest.substring(0, firstColon).trim()
    const type = rest.substring(firstColon + 1, secondColon).trim()
    const color = rest.substring(secondColon + 1, thirdColon).trim()
    
    // Everything after the third colon
    const remaining = rest.substring(thirdColon + 1)
    
    let figmaLink: string | undefined = undefined
    let downloadUrl: string | undefined = undefined
    
    // Look for /logos/ to split figmaLink and downloadUrl
    const logosIndex = remaining.indexOf('/logos/')
    
    if (logosIndex > 0) {
      // Found /logos/, split there
      figmaLink = remaining.substring(0, logosIndex).trim()
      downloadUrl = remaining.substring(logosIndex).trim()
    } else if (remaining.startsWith('http')) {
      // Only figmaLink, no downloadUrl
      figmaLink = remaining.trim()
    } else if (remaining.startsWith('/')) {
      // Only downloadUrl, no figmaLink
      downloadUrl = remaining.trim()
    } else if (remaining.trim()) {
      // Try to split by the last colon (if there's a colon after http://)
      const lastColon = remaining.lastIndexOf(':')
      if (lastColon > 0 && remaining.substring(0, lastColon).includes('http')) {
        // Likely format: http://...:downloadUrl
        figmaLink = remaining.substring(0, lastColon).trim()
        downloadUrl = remaining.substring(lastColon + 1).trim()
      } else {
        // Assume it's a downloadUrl if it starts with /
        if (remaining.trim().startsWith('/')) {
          downloadUrl = remaining.trim()
        } else {
          // Fallback: treat as figmaLink
          figmaLink = remaining.trim()
        }
      }
    }
    
    // Clean up figmaLink (remove trailing colon if present)
    if (figmaLink) {
      figmaLink = figmaLink.replace(/:$/, '').trim()
      if (figmaLink === '') figmaLink = undefined
    }
    
    const logo = {
      brand,
      type,
      color,
      figmaLink: figmaLink || undefined,
      downloadUrl: downloadUrl || undefined,
    }
    console.log('Parsed logo:', logo)
    logos.push(logo)
  })
  
  // Remove LOGO_IMAGE markers from text
  const text = content.replace(/LOGO_IMAGE:[^\n]+/g, '').trim()
  
  return { text, logos }
}

// Parse UX findings from message content
// Format: UX_FINDINGS:title:source (date):sourceUrl:[JSON array of findings]
// Handles multiple UX_FINDINGS directives by combining all findings
function parseUXFindings(content: string): { text: string; findings: any[]; title?: string; source?: string; sourceUrl?: string } {
  // More robust regex that handles:
  // - Source with dates in parentheses: "Jurnii (2024-12-13)"
  // - Source URLs with colons: "https://..."
  // - Multiline JSON arrays
  // Strategy: Match UX_FINDINGS: then find the JSON array (starts with [ and ends with ])
  // Everything between UX_FINDINGS: and the [ is the metadata (title:source:sourceUrl)
  
  // First, find all UX_FINDINGS directives by looking for the pattern and finding the matching JSON array
  const findingsRegex = /UX_FINDINGS:([^\n]*?):(\[[\s\S]*?\])/g
  const matches: Array<{ fullMatch: string; metadata: string; jsonArray: string; index: number }> = []
  let match
  
  // Reset regex lastIndex
  findingsRegex.lastIndex = 0
  
  while ((match = findingsRegex.exec(content)) !== null) {
    const fullMatch = match[0]
    const metadata = match[1] // Everything between UX_FINDINGS: and the [
    const jsonArray = match[2] // The JSON array
    
    // Parse metadata (title:source:sourceUrl)
    // Split by : but be careful with URLs
    const metadataParts = metadata.split(':')
    let title = metadataParts[0] || ''
    let source = metadataParts[1] || ''
    let sourceUrl = metadataParts.slice(2).join(':') || '' // Rejoin in case sourceUrl contains colons
    
    matches.push({
      fullMatch,
      metadata,
      jsonArray,
      index: match.index || 0
    })
  }
  
  // If no matches found, return original content
  if (matches.length === 0) {
    return { text: content, findings: [] }
  }
  
  // Combine all findings from all matches
  let allFindings: any[] = []
  let title: string | undefined
  let source: string | undefined
  let sourceUrl: string | undefined

  // Process each match
  matches.forEach((matchObj, index) => {
    try {
      const matchFindings = JSON.parse(matchObj.jsonArray)
      if (Array.isArray(matchFindings)) {
        allFindings = allFindings.concat(matchFindings)
      }

      // Parse metadata (title:source:sourceUrl)
      const metadataParts = matchObj.metadata.split(':')
      const matchTitle = metadataParts[0] || ''
      const matchSource = metadataParts[1] || ''
      const matchSourceUrl = metadataParts.slice(2).join(':') || ''

      // Use first match for metadata, or combine if multiple reports
      if (index === 0) {
        title = matchTitle || undefined
        source = matchSource || undefined
        sourceUrl = matchSourceUrl || undefined
      } else {
        // If multiple reports, combine titles/sources
        if (matchTitle && matchTitle !== title) {
          title = title ? `${title}; ${matchTitle}` : matchTitle
        }
        if (matchSource && matchSource !== source) {
          source = source ? `${source}; ${matchSource}` : matchSource
        }
      }
    } catch (e) {
      console.error('Failed to parse UX findings from match:', e, matchObj)
    }
  })

  // Remove ALL UX_FINDINGS directives from text
  // Iterate in reverse to avoid issues with changing string indices
  let text = content
  for (let i = matches.length - 1; i >= 0; i--) {
    const matchObj = matches[i]
    const startIndex = matchObj.index
    const endIndex = startIndex + matchObj.fullMatch.length
    text = text.substring(0, startIndex) + text.substring(endIndex)
  }
  
  // Also remove any remaining UX_FINDINGS patterns that might have been missed
  // This handles edge cases where the regex might not have caught everything
  text = text.replace(/UX_FINDINGS:[^\n]*/g, '') // Remove any single-line directives
  text = text.replace(/UX_FINDINGS:[\s\S]*?\]/g, '') // Remove multiline directives with JSON
  text = text.replace(/UX_FINDINGS:[\s\S]*$/g, '') // Remove any remaining at end of string
  
  // Clean up any double newlines or extra whitespace
  text = text.replace(/\n\n+/g, '\n\n').trim()
  // Remove any leading/trailing newlines
  text = text.replace(/\n+$/g, '').replace(/^\n+/g, '').trim()
  
  return { text, findings: allFindings, title, source, sourceUrl }
}

// Parse review summary from message content
// Format: REVIEW_SUMMARY:rating:totalReviews:themes:strengths
function parseReviewSummary(content: string): { text: string; summary: any } {
  const summaryRegex = /REVIEW_SUMMARY:([^:]*):([^:]*):(\[[^\]]*\]):(\[[^\]]*\])/g
  const match = summaryRegex.exec(content)
  
  if (!match) {
    return { text: content, summary: null }
  }
  
  let overallRating: number | undefined
  let totalReviews: number | undefined
  let commonThemes: string[] = []
  let strengths: string[] = []
  
  try {
    overallRating = match[1] ? parseFloat(match[1]) : undefined
    totalReviews = match[2] ? parseInt(match[2]) : undefined
    commonThemes = match[3] ? JSON.parse(match[3]) : []
    strengths = match[4] ? JSON.parse(match[4]) : []
  } catch (e) {
    console.error('Failed to parse review summary:', e)
  }
  
  // Remove REVIEW_SUMMARY marker from text
  const text = content.replace(summaryRegex, '').trim()
  
  return {
    text,
    summary: {
      overallRating,
      totalReviews,
      commonThemes,
      strengths,
    },
  }
}

export function ChatWithCH() {
  const [mounted, setMounted] = useState(true) // Start as true since this is a client component
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hey, what do you need help with?',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false) // Track if user is actively scrolling
  const [userHasScrolled, setUserHasScrolled] = useState(false) // Track if user has manually scrolled
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollTopRef = useRef<number>(0)
  const lastAutoScrollTimeRef = useRef<number>(0) // Throttle auto-scroll calls
  // Use refs to track scroll state so they're always current in closures
  const userHasScrolledRef = useRef<boolean>(false)
  const isScrollingRef = useRef<boolean>(false)
  const isUserScrolledUpRef = useRef<boolean>(false)
  const triggerKool = useSceneStore((state) => state.triggerKool)
  
  // Design request flow state
  const [isDesignRequestFlow, setIsDesignRequestFlow] = useState(false)
  const [requestStep, setRequestStep] = useState<'area' | 'what' | 'why' | 'context' | 'goals' | 'useCases' | 'deadline' | 'complete'>('area')
  const [editingField, setEditingField] = useState<'area' | 'what' | 'why' | 'context' | 'goals' | 'useCases' | null>(null)
  const requestArea = useSceneStore((state) => state.requestArea)
  const setRequestArea = useSceneStore((state) => state.setRequestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const setUserRequest = useSceneStore((state) => state.setUserRequest)
  const setDeadline = useSceneStore((state) => state.setDeadline)
  const goToScene = useSceneStore((state) => state.goToScene)
  
  // Helper to skip optional field
  const handleSkip = () => {
    if (requestStep === 'context') {
      const updatedRequest = { ...userRequest, context: '' }
      setUserRequest(updatedRequest)
      triggerKool()
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: '(skipped)',
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'What are your goals? (optional)',
          timestamp: new Date(),
        },
      ])
      setRequestStep('goals')
      setInputValue('')
    } else if (requestStep === 'goals') {
      const updatedRequest = { ...userRequest, goals: '' }
      setUserRequest(updatedRequest)
      triggerKool()
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: '(skipped)',
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Any use cases? (optional)',
          timestamp: new Date(),
        },
      ])
      setRequestStep('useCases')
      setInputValue('')
    } else if (requestStep === 'useCases') {
      const updatedRequest = { ...userRequest, useCases: '' }
      setUserRequest(updatedRequest)
      triggerKool()
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: '(skipped)',
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'When do you need this?',
          timestamp: new Date(),
        },
      ])
      setRequestStep('deadline')
      setInputValue('')
    }
  }
  
  // Helper to edit a field
  const handleEditField = (field: 'area' | 'what' | 'why' | 'context' | 'goals' | 'useCases') => {
    setEditingField(field)
    if (field === 'area') {
      setRequestStep('area')
      setInputValue('')
    } else {
      setRequestStep(field)
      setInputValue(field === 'what' ? userRequest.what : field === 'why' ? userRequest.why : field === 'context' ? userRequest.context : field === 'goals' ? userRequest.goals : userRequest.useCases)
    }
  }
  
  const areaOptions = ['Sports', 'Casino', 'Loyalty', 'Authentication', 'Poker', 'Other area']
  
  // Dynamic suggestions based on knowledge base
  const [suggestions, setSuggestions] = useState<string[]>([
    'Make a design request',
    'Tell me about our tone of voice',
    'What are our brand guidelines?',
    'Do you need retention data?',
    'Tell me about our design system tokens',
    'What are BetOnline\'s primary colors?',
  ])
  
  // Load suggestions from API
  useEffect(() => {
    fetch('/api/suggestions')
      .then(res => res.json())
      .then(data => {
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions)
        }
      })
      .catch(err => {
        console.error('Failed to load suggestions:', err)
        // Keep default suggestions on error
      })
  }, [])

  // Ensure component is mounted before showing animations
  useEffect(() => {
    // Use a small delay to ensure client-side hydration is complete
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Listen for reset event to bring CH back and reset chat
  useEffect(() => {
    const handleResetChatAndCH = () => {
      // Reset design request flow state
      setIsDesignRequestFlow(false)
      setRequestStep('area')
      setEditingField(null)
      
      // Reset chat messages to initial state
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: 'Hey, what do you need help with?',
          timestamp: new Date(),
        },
      ])
      setInputValue('')
    }
    
    window.addEventListener('resetChatAndCH', handleResetChatAndCH)
    return () => window.removeEventListener('resetChatAndCH', handleResetChatAndCH)
  }, [])
  
  // Listen for clickable suggestion clicks from numbered lists
  useEffect(() => {
    const handleClickSuggestion = (e: Event) => {
      const customEvent = e as CustomEvent
      const suggestionText = customEvent.detail
      // Use a timeout to ensure handleSend is available
      setTimeout(() => {
        handleSend(undefined, suggestionText)
      }, 0)
    }
    
    window.addEventListener('clickSuggestion', handleClickSuggestion)
    return () => window.removeEventListener('clickSuggestion', handleClickSuggestion)
  }, []) // handleSend is stable, so empty deps is fine

  // Check if user is at/near the bottom of the chat
  const isAtBottom = () => {
    const container = messagesContainerRef.current
    if (!container) return true
    
    const threshold = 150 // pixels from bottom (increased for better detection)
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold
    return isNearBottom
  }

  const scrollToBottom = (force = false) => {
    // Don't auto-scroll if user is actively scrolling, has scrolled up, or has manually scrolled
    if (isScrolling || userHasScrolled || (!force && isUserScrolledUp)) {
      return
    }
    
    // Only auto-scroll if user is already at bottom, or if forced (new messages)
    if (force || isAtBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setIsUserScrolledUp(false)
      setUserHasScrolled(false) // Reset when we force scroll (new message)
    }
  }

  // Track user scroll to detect when they scroll up
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop
      const scrollDelta = currentScrollTop - lastScrollTopRef.current
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const distanceFromBottom = scrollHeight - currentScrollTop - clientHeight
      
      // Immediately check if user scrolled up (negative delta or scrollTop decreased)
      // OR if user is not at the bottom
      if (scrollDelta < -5 || (scrollDelta === 0 && currentScrollTop < lastScrollTopRef.current) || distanceFromBottom > 50) {
        setUserHasScrolled(true)
        setIsUserScrolledUp(true)
        // Update refs immediately so streaming interval can check them - CRITICAL for stopping auto-scroll
        userHasScrolledRef.current = true
        isUserScrolledUpRef.current = true
        // Reset auto-scroll throttle when user scrolls up - set far in future to prevent any auto-scroll
        lastAutoScrollTimeRef.current = Date.now() + 10000
      }
      
      // Update last scroll position
      lastScrollTopRef.current = currentScrollTop
      
      // Mark that user is actively scrolling
      setIsScrolling(true)
      isScrollingRef.current = true
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // After user stops scrolling for 200ms, check position
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
        isScrollingRef.current = false
        const atBottom = isAtBottom()
        setIsUserScrolledUp(!atBottom)
        isUserScrolledUpRef.current = !atBottom
        
        // If user is at bottom, reset manual scroll flag
        if (atBottom) {
          setUserHasScrolled(false)
          userHasScrolledRef.current = false
        }
      }, 200)

      // Immediately check if user scrolled up significantly
      const atBottom = isAtBottom()
      if (!atBottom) {
        setIsUserScrolledUp(true)
        setUserHasScrolled(true)
        isUserScrolledUpRef.current = true
        userHasScrolledRef.current = true
        // Reset auto-scroll throttle when user scrolls up
        lastAutoScrollTimeRef.current = 0
      } else if (atBottom && scrollDelta > 5) {
        // User scrolled down to bottom - reset manual scroll flag
        setUserHasScrolled(false)
        setIsUserScrolledUp(false)
        userHasScrolledRef.current = false
        isUserScrolledUpRef.current = false
      }
    }

    // Initialize last scroll position
    lastScrollTopRef.current = container.scrollTop

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Only auto-scroll on new messages if user is at bottom and not actively scrolling
  useEffect(() => {
    if (messages.length > 0 && !isUserScrolledUp && !isScrolling && !userHasScrolled) {
      // Small delay to ensure DOM is updated
      requestAnimationFrame(() => {
        if (!isScrolling && !isUserScrolledUp && !userHasScrolled) {
          scrollToBottom(false) // Don't force - respect user's scroll position
        }
      })
    }
  }, [messages, isUserScrolledUp, isScrolling, userHasScrolled]) // Only when messages change, not streamingContent

  // DISABLED: Auto-scroll during streaming - let the streaming interval handle it
  // This prevents conflicts with manual scrolling
  // useEffect(() => {
  //   if (streamingContent && !isUserScrolledUp && !isScrolling) {
  //     requestAnimationFrame(() => {
  //       if (!isScrolling && !isUserScrolledUp && isAtBottom()) {
  //         scrollToBottom(false)
  //       }
  //     })
  //   }
  // }, [streamingContent, isUserScrolledUp, isScrolling])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          setUploadedImages((prev) => [...prev, base64])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Check if current step is optional field (for Skip button and empty input handling)
  const isOptionalField = isDesignRequestFlow && (requestStep === 'context' || requestStep === 'goals' || requestStep === 'useCases')
  
  const handleSend = async (e?: React.FormEvent, messageText?: string) => {
    e?.preventDefault()
    const textToSend = messageText || inputValue.trim()
    
    // Only block empty input if not in optional field
    if (!textToSend && uploadedImages.length === 0 && !isOptionalField) return

    // Check if user wants to start design request flow
    if (!isDesignRequestFlow && textToSend.toLowerCase().includes('make a design request')) {
      setIsDesignRequestFlow(true)
      setRequestStep('area')
      triggerKool()
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: textToSend,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Which area are you requesting?',
          timestamp: new Date(),
        },
      ])
      setInputValue('')
      return
    }

    // Handle design request flow
    if (isDesignRequestFlow) {
      if (requestStep === 'area') {
        // User selected an area
        const selectedArea = textToSend
        setRequestArea(selectedArea)
        triggerKool()
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: selectedArea,
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'What do you need?',
            timestamp: new Date(),
          },
        ])
        setRequestStep('what')
        setInputValue('')
        return
      } else if (requestStep === 'what') {
        const updatedRequest = { ...userRequest, what: textToSend }
        setUserRequest(updatedRequest)
        triggerKool()
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Why do you need this?',
            timestamp: new Date(),
          },
        ])
        setRequestStep('why')
        setInputValue('')
        return
      } else if (requestStep === 'why') {
        const updatedRequest = { ...userRequest, why: textToSend }
        setUserRequest(updatedRequest)
        triggerKool()
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Any additional context? (optional - press Enter to skip)',
            timestamp: new Date(),
          },
        ])
        setRequestStep('context')
        setInputValue('')
        return
      } else if (requestStep === 'context') {
        const updatedRequest = { ...userRequest, context: textToSend || '' }
        setUserRequest(updatedRequest)
        triggerKool()
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend || '(skipped)',
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'What are your goals? (optional - press Enter to skip)',
            timestamp: new Date(),
          },
        ])
        setRequestStep('goals')
        setInputValue('')
        return
      } else if (requestStep === 'goals') {
        const updatedRequest = { ...userRequest, goals: textToSend || '' }
        setUserRequest(updatedRequest)
        triggerKool()
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend || '(skipped)',
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Any use cases? (optional - press Enter to skip)',
            timestamp: new Date(),
          },
        ])
        setRequestStep('useCases')
        setInputValue('')
        return
      } else if (requestStep === 'useCases') {
        const updatedRequest = { ...userRequest, useCases: textToSend || '' }
        setUserRequest(updatedRequest)
        triggerKool()
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend || '(skipped)',
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'When do you need this?',
            timestamp: new Date(),
          },
        ])
        setRequestStep('deadline')
        setInputValue('')
        return
      } else if (requestStep === 'deadline') {
        setDeadline(textToSend)
        triggerKool()
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Request submitted! I\'ll get started on this right away.',
            timestamp: new Date(),
          },
        ])
        setRequestStep('complete')
        setIsDesignRequestFlow(false)
        setInputValue('')
        setEditingField(null)
        
        // Submit to API and show delivering scene
        goToScene('delivering')
        return
      }
    }

    // Normal chat flow
    // Trigger kool animation when user sends a message
    triggerKool()

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend || 'Analyze this image',
      timestamp: new Date(),
      images: uploadedImages.length > 0 ? [...uploadedImages] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = textToSend
    const currentImages = [...uploadedImages]
    setInputValue('')
    setUploadedImages([])
    setIsTyping(true)

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .slice(-5) // Last 5 messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Call AI chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput || 'Analyze this image',
          conversationHistory,
          images: currentImages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const messageId = (Date.now() + 1).toString()
      const fullResponse = data.response
      
      // Create message with empty content initially
      const assistantMessage: ChatMessage = {
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        generatedImage: data.generatedImage, // AI-generated image URL
      }

      // Add message to chat immediately with empty content
      setMessages((prev) => [...prev, assistantMessage])
      
      // Stream the response character by character (ChatGPT-style)
      setStreamingMessageId(messageId)
      setStreamingContent('')
      
      let currentIndex = 0
      const typeSpeed = 10 // milliseconds per character (faster than speech bubbles)
      
      const streamInterval = setInterval(() => {
        if (currentIndex < fullResponse.length) {
          currentIndex++
          const partialContent = fullResponse.slice(0, currentIndex)
          setStreamingContent(partialContent)
          
          // Update the message content in real-time
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === messageId 
                ? { ...msg, content: partialContent }
                : msg
            )
          )
          
          // Auto-scroll during streaming - COMPLETELY DISABLED if user has scrolled up
          // Check refs FIRST - if user has scrolled, don't even check position
          if (userHasScrolledRef.current || isUserScrolledUpRef.current || isScrollingRef.current) {
            // User has scrolled up - DO NOT auto-scroll at all
            return
          }
          
          // Only proceed if user hasn't scrolled up
          const container = messagesContainerRef.current
          if (!container) return
          
          // Check position directly - if not at bottom, don't scroll
          const scrollTop = container.scrollTop
          const scrollHeight = container.scrollHeight
          const clientHeight = container.clientHeight
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight
          
          // If user is more than 50px from bottom, they've scrolled up - stop immediately
          if (distanceFromBottom > 50) {
            // User is not at bottom - update refs and stop
            userHasScrolledRef.current = true
            isUserScrolledUpRef.current = true
            return
          }
          
          // Only auto-scroll if user is VERY close to bottom (within 30px)
          // Double-check refs haven't changed
          if (distanceFromBottom < 30 && !userHasScrolledRef.current && !isScrollingRef.current && !isUserScrolledUpRef.current) {
            const now = Date.now()
            const timeSinceLastScroll = now - lastAutoScrollTimeRef.current
            
            // Only attempt scroll every 500ms (more throttled)
            if (timeSinceLastScroll > 500) {
              lastAutoScrollTimeRef.current = now
              // Use requestAnimationFrame for smoother scrolling
              requestAnimationFrame(() => {
                // Triple-check refs and position before scrolling
                const container = messagesContainerRef.current
                if (!container || !messagesEndRef.current) return
                
                // Check refs FIRST - if user scrolled, abort immediately
                if (userHasScrolledRef.current || isUserScrolledUpRef.current || isScrollingRef.current) {
                  return // Abort - user has scrolled
                }
                
                // Check position again - if not at bottom, abort
                const currentDistance = container.scrollHeight - container.scrollTop - container.clientHeight
                if (currentDistance > 50) {
                  // User scrolled up - update refs and abort
                  userHasScrolledRef.current = true
                  isUserScrolledUpRef.current = true
                  return
                }
                
                // Only scroll if still very close to bottom
                if (currentDistance < 30) {
                  // Use scrollTop directly instead of scrollIntoView to avoid jitter
                  const targetScroll = container.scrollHeight - container.clientHeight
                  if (Math.abs(container.scrollTop - targetScroll) > 5) {
                    container.scrollTop = targetScroll
                  }
                }
              })
            }
          }
        } else {
          // Streaming complete - scroll to bottom if user was already at bottom
          clearInterval(streamInterval)
          setStreamingMessageId(null)
          setStreamingContent('')
          if (isAtBottom()) {
            scrollToBottom(false)
          }
        }
      }, typeSpeed)
      
    } catch (error) {
      console.error('Chat error:', error)
      // Fallback response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Try asking me about colors, typography, components, or our design system!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Chat is always open - no conditional rendering
  if (!mounted) {
    return (
      <div className="w-full h-full flex flex-col neu-soft border border-white/10">
        <div className="w-full p-4 border-b border-white/5 flex items-center gap-2 flex-shrink-0">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            className="text-white/60 flex-shrink-0"
          >
            <path 
              d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V10C14 10.5523 13.5523 11 13 11H6L3 14V3Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-white/80 text-sm font-light">Talk with CH</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/40 text-xs">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-full neu-soft border border-white/10"
      >
        {/* Chat Header - Fixed at top */}
        <div className="w-full p-4 border-b border-white/5 flex items-center gap-2 flex-shrink-0">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            className="text-white/60 flex-shrink-0"
          >
            <path 
              d="M2 3C2 2.44772 2.44772 2 3 2H13C13.5523 2 14 2.44772 14 3V10C14 10.5523 13.5523 11 13 11H6L3 14V3Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-white/80 text-sm font-light">Talk with CH</span>
        </div>

        {/* Chat Messages - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col min-h-0">
                {/* Suggestion Prompts - Show when chat is open and only has initial message */}
                {messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2 mb-2"
                  >
                    <div className="text-white/50 text-xs font-light mb-3">
                      Try asking about:
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => {
                            // Send suggestion directly without updating input value first
                            handleSend(undefined, suggestion)
                          }}
                          className="text-left p-2.5 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all text-white/70 text-xs font-light"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {/* Show editable summary cards for completed design request fields */}
                {isDesignRequestFlow && (requestStep !== 'area' || requestArea) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mb-4"
                  >
                    {requestArea && (
                      <motion.button
                        onClick={() => handleEditField('area')}
                        className="w-full text-left p-3 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="text-white/50 text-xs font-light mb-1">Area</div>
                        <div className="text-white text-sm font-light">{requestArea}</div>
                      </motion.button>
                    )}
                    {userRequest.what && (
                      <motion.button
                        onClick={() => handleEditField('what')}
                        className="w-full text-left p-3 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="text-white/50 text-xs font-light mb-1">What</div>
                        <div className="text-white text-sm font-light">{userRequest.what}</div>
                      </motion.button>
                    )}
                    {userRequest.why && (
                      <motion.button
                        onClick={() => handleEditField('why')}
                        className="w-full text-left p-3 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="text-white/50 text-xs font-light mb-1">Why</div>
                        <div className="text-white text-sm font-light">{userRequest.why}</div>
                      </motion.button>
                    )}
                    {userRequest.context && (
                      <motion.button
                        onClick={() => handleEditField('context')}
                        className="w-full text-left p-3 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="text-white/50 text-xs font-light mb-1">Context</div>
                        <div className="text-white text-sm font-light">{userRequest.context}</div>
                      </motion.button>
                    )}
                    {userRequest.goals && (
                      <motion.button
                        onClick={() => handleEditField('goals')}
                        className="w-full text-left p-3 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="text-white/50 text-xs font-light mb-1">Goals</div>
                        <div className="text-white text-sm font-light">{userRequest.goals}</div>
                      </motion.button>
                    )}
                    {userRequest.useCases && (
                      <motion.button
                        onClick={() => handleEditField('useCases')}
                        className="w-full text-left p-3 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="text-white/50 text-xs font-light mb-1">Use Cases</div>
                        <div className="text-white text-sm font-light">{userRequest.useCases}</div>
                      </motion.button>
                    )}
                  </motion.div>
                )}
                
                {messages.map((message, msgIndex) => {
                  // Check if this is the area selection message - show buttons if assistant message and we're in design flow on area step
                  const isAreaSelectionMessage = 
                    message.role === 'assistant' && 
                    message.content === 'Which area are you requesting?' && 
                    isDesignRequestFlow && 
                    requestStep === 'area'
                  
                  // Use streaming content if this message is currently streaming
                  const messageContent = streamingMessageId === message.id && streamingContent 
                    ? streamingContent 
                    : message.content
                  
                  // Parse all special content types in order
                  // Always parse to remove directives from text, but only show cards when streaming is complete
                  const { text: textAfterSwatches, swatches } = parseColorSwatches(messageContent)
                  const { text: textAfterTokens, tokens } = parseTokenCopies(textAfterSwatches)
                  const { text: textAfterLogos, logos } = parseLogoImages(textAfterTokens)
                  
                  // Parse findings to remove UX_FINDINGS directives from text (prevents CSS code from showing)
                  // But only show actual findings cards when streaming is complete
                  const { text: textAfterFindings, findings, title: findingsTitle, source: findingsSource, sourceUrl: findingsSourceUrl } = parseUXFindings(textAfterLogos)
                  
                  // During streaming, don't show findings yet (they'll show as skeleton)
                  // After streaming, show the actual findings cards
                  const shouldShowFindings = findings.length > 0 && streamingMessageId !== message.id
                  
                  const { text: finalText, summary: reviewSummary } = parseReviewSummary(textAfterFindings)
                  
                  // Debug: log parsed content
                  if (logos.length > 0) {
                    console.log('Parsed logos from message:', logos)
                  }
                  if (findings.length > 0) {
                    console.log('Parsed UX findings from message:', findings)
                  }
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'neu-inset bg-white/5 text-white text-sm'
                            : 'neu-soft bg-white/5 text-white/90 text-sm'
                        }`}
                      >
                        {/* Area selection buttons */}
                        {isAreaSelectionMessage && (
                          <div className="space-y-2 mt-2">
                            {areaOptions.map((area) => (
                              <motion.button
                                key={area}
                                onClick={() => handleSend(undefined, area)}
                                className="w-full text-left p-2.5 neu-flat rounded-lg border border-white/10 hover:neu-inset transition-all text-white/80 text-sm font-light"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {area}
                              </motion.button>
                            ))}
                          </div>
                        )}
                        
                        {/* Display uploaded images */}
                        {message.images && message.images.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {message.images.map((img, idx) => (
                              <ImageWithSkeleton
                                key={idx}
                                src={img}
                                alt={`Uploaded ${idx + 1}`}
                                className="rounded-lg object-contain border border-white/10"
                                maxHeight="192px"
                                skeletonHeight={192}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Display generated image */}
                        {message.generatedImage && (
                          <div className="mb-2">
                            <ImageWithSkeleton
                              src={message.generatedImage}
                              alt="AI Generated"
                              className="rounded-lg object-contain border border-white/10"
                              maxHeight="256px"
                              skeletonHeight={256}
                            />
                          </div>
                        )}
                        
                        {/* Render logo images inline (before text) */}
                        {logos.length > 0 && (
                          <div className="mb-3 space-y-3">
                            {logos.map((logo, idx) => (
                              <LogoImageBlock key={idx} logo={logo} />
                            ))}
                          </div>
                        )}
                        
                        {/* Render text with markdown-style formatting and visual markups */}
                        {/* Always show text - skeleton loaders are only for images, not text */}
                        {finalText && (
                        <div className="space-y-2 inline-block">
                          {formatTextWithMarkups(finalText)}
                          {/* Show typing cursor during streaming */}
                          {streamingMessageId === message.id && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                              className="inline-block w-0.5 h-4 bg-white/80 ml-1 align-middle"
                            />
                          )}
                        </div>
                        )}
                        
                        {/* Render token copy blocks */}
                        {tokens.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {tokens.map((token, idx) => (
                              <TokenCopyBlock key={idx} token={token} />
                            ))}
                          </div>
                        )}
                        
                        {/* Render color swatches */}
                        {swatches.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {swatches.map((swatch, idx) => (
                              <ColorSwatchBlock key={idx} swatch={swatch} />
                            ))}
                          </div>
                        )}
                        
                        {/* Render UX findings card - only show when streaming is complete */}
                        {findings.length > 0 && (
                          <>
                            {streamingMessageId === message.id ? (
                              // Show skeleton loader while streaming (don't show actual findings yet)
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4 space-y-3"
                              >
                                <div className="h-4 bg-white/10 rounded w-1/3 mb-3 animate-pulse"></div>
                                <div className="space-y-3">
                                  {[1, 2].map((idx) => (
                                    <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 bg-white/10 rounded animate-pulse"></div>
                                        <div className="h-5 bg-white/10 rounded w-20 animate-pulse"></div>
                                        <div className="h-5 bg-white/10 rounded w-16 animate-pulse"></div>
                                      </div>
                                      <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                                      <div className="h-3 bg-white/10 rounded w-full animate-pulse"></div>
                                      <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse"></div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            ) : shouldShowFindings ? (
                              // Show actual card when streaming is complete
                              <UXFindingsCard
                                findings={findings}
                                title={findingsTitle}
                                source={findingsSource}
                                sourceUrl={findingsSourceUrl}
                              />
                            ) : null}
                          </>
                        )}
                        
                        {/* Render review summary card */}
                        {reviewSummary && (
                          <ReviewSummaryCard
                            overallRating={reviewSummary.overallRating}
                            totalReviews={reviewSummary.totalReviews}
                            commonThemes={reviewSummary.commonThemes}
                            strengths={reviewSummary.strengths}
                          />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="neu-soft rounded-lg p-3 bg-white/5">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-white/60 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
        </div>

        {/* Input - Fixed at bottom */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/5 space-y-2 flex-shrink-0">
                {/* Preview uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${idx + 1}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white/80 text-xs hover:bg-white/30"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="neu-inset rounded-lg p-2 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <motion.button
                    type="button"
                    onClick={() => {
                      // Trigger design request flow
                      setIsDesignRequestFlow(true)
                      setRequestStep('area')
                      triggerKool()
                      
                      // Add area selection message with buttons
                      setMessages((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          role: 'assistant',
                          content: 'Which area are you requesting?',
                          timestamp: new Date(),
                        },
                      ])
                    }}
                    className="px-2 py-1.5 neu-flat rounded-lg hover:neu-inset transition-all text-white/80 text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Make design request"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 16 16" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M11.5 2.5L13.5 4.5L6 12H4V10L11.5 2.5Z" />
                      <path d="M9.5 4.5L11.5 6.5" />
                    </svg>
                  </motion.button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      isDesignRequestFlow && requestStep === 'area' ? 'Select an area...' :
                      isDesignRequestFlow && requestStep === 'what' ? 'What do you need?' :
                      isDesignRequestFlow && requestStep === 'why' ? 'Why do you need this?' :
                      isDesignRequestFlow && requestStep === 'context' ? 'Any additional context? (optional)' :
                      isDesignRequestFlow && requestStep === 'goals' ? 'What are your goals? (optional)' :
                      isDesignRequestFlow && requestStep === 'useCases' ? 'Any use cases? (optional)' :
                      isDesignRequestFlow && requestStep === 'deadline' ? 'When do you need this?' :
                      'Ask CH anything...'
                    }
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm font-light focus:outline-none"
                    autoFocus={true}
                  />
                  {/* Skip button for optional fields */}
                  {isDesignRequestFlow && (requestStep === 'context' || requestStep === 'goals' || requestStep === 'useCases') && (
                    <motion.button
                      type="button"
                      onClick={handleSkip}
                      className="px-3 py-1.5 neu-flat rounded-lg hover:neu-inset transition-all text-white/60 text-xs font-light"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Skip
                    </motion.button>
                  )}
                  <motion.button
                    type="submit"
                    disabled={(!inputValue.trim() && uploadedImages.length === 0 && !isOptionalField) || isTyping}
                    className="px-3 py-1.5 neu-flat rounded-lg hover:neu-inset transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/80 text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    →
                  </motion.button>
                </div>
              </form>
      </motion.div>
    </div>
  )
}

// Token Copy Block Component
function TokenCopyBlock({ token }: { token: TokenCopy }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 group">
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-xs">{token.token}</div>
        <div className="text-white/60 text-xs font-mono break-all">{token.value}</div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleCopy(token.value)}
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-xs"
          title="Copy to clipboard"
        >
          {copied ? '✓' : '📋'}
        </button>
        {token.figmaLink && (
          <a
            href={token.figmaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-xs"
            title="Open in Figma"
          >
            🔗
          </a>
        )}
      </div>
    </div>
  )
}

// Color Swatch Block Component
function ColorSwatchBlock({ swatch }: { swatch: ColorSwatch }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
      {/* Color swatch */}
      <div
        className="w-12 h-12 rounded-lg border-2 border-white/20 flex-shrink-0"
        style={{ backgroundColor: swatch.hex }}
      />
      {/* Color info */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-xs">{swatch.token}</div>
        <div className="text-white/60 text-xs font-mono">{swatch.hex}</div>
        {swatch.description && (
          <div className="text-white/50 text-xs mt-0.5">{swatch.description}</div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleCopy(swatch.hex)}
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-xs"
          title="Copy hex to clipboard"
        >
          {copied ? '✓' : '📋'}
        </button>
        {swatch.figmaLink && (
          <a
            href={swatch.figmaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-xs"
            title="Open in Figma"
          >
            🔗
          </a>
        )}
      </div>
    </div>
  )
}

// Skeleton Loader Component
function ImageSkeleton({ width = 120, height = 60, className = '' }: { width?: number; height?: number; className?: string }) {
  return (
    <div 
      className={`bg-white/5 border border-white/10 rounded relative overflow-hidden ${className}`}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto', minHeight: height ? `${height}px` : '192px' }}
    >
      <div 
        className="w-full h-full bg-gradient-to-r from-white/5 via-white/10 to-white/5"
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
    </div>
  )
}

// Image with Skeleton Loader Component
function ImageWithSkeleton({ 
  src, 
  alt, 
  className = '', 
  maxWidth = '100%', 
  maxHeight = '192px',
  skeletonWidth,
  skeletonHeight = 192
}: { 
  src: string
  alt: string
  className?: string
  maxWidth?: string
  maxHeight?: string
  skeletonWidth?: number
  skeletonHeight?: number
}) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="relative">
      {imageLoading && !imageError && (
        <ImageSkeleton 
          width={skeletonWidth} 
          height={skeletonHeight}
          className="absolute inset-0"
        />
      )}
      {!imageError && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            maxWidth,
            maxHeight,
            width: 'auto',
            height: 'auto'
          }}
          onLoad={() => {
            setImageLoaded(true)
            setImageLoading(false)
          }}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
        />
      )}
      {imageError && (
        <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded text-white/50 text-xs p-4" style={{ minHeight: `${skeletonHeight}px` }}>
          Failed to load image
        </div>
      )}
    </div>
  )
}

// Logo Image Block Component
function LogoImageBlock({ logo }: { logo: LogoImage }) {
  // Generate logo file path based on brand, type, and color
  const getLogoPath = () => {
    // Use downloadUrl if provided and it's a valid path
    if (logo.downloadUrl && logo.downloadUrl.startsWith('/')) {
      return logo.downloadUrl
    }
    
    // Construct path from brand, type, and color
    // Format: /logos/BrandName/type/color.svg
    const brandName = logo.brand.replace(/\s+/g, '')
    const typeName = logo.type.toLowerCase()
    const colorName = logo.color.replace(/\s+/g, '').toLowerCase()
    
    return `/logos/${brandName}/${typeName}/${colorName}.svg`
  }
  
  const logoPath = getLogoPath()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Debug: log the logo path
  useEffect(() => {
    console.log('LogoImageBlock - logo:', logo)
    console.log('LogoImageBlock - logoPath:', logoPath)
    console.log('LogoImageBlock - downloadUrl:', logo.downloadUrl)
  }, [logo, logoPath])
  
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
      <div className="text-white font-medium text-xs mb-2">
        {logo.brand} {logo.type} ({logo.color})
      </div>
      <div className="flex items-center gap-3">
        {imageLoading && !imageError && (
          <ImageSkeleton width={120} height={60} />
        )}
        {!imageError && (
          <img
            src={logoPath}
            alt={`${logo.brand} ${logo.type} ${logo.color}`}
            className={`max-w-[120px] max-h-[60px] object-contain bg-white/5 rounded transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
            onLoad={() => {
              console.log('Logo loaded successfully:', logoPath)
              setImageLoaded(true)
              setImageLoading(false)
            }}
            onError={(e) => {
              console.error('Logo failed to load:', logoPath, e)
              console.error('Logo object:', logo)
              setImageError(true)
              setImageLoading(false)
            }}
            style={{ 
              width: 'auto',
              height: 'auto',
              maxWidth: '120px',
              maxHeight: '60px'
            }}
          />
        )}
        {imageError && (
          <div className="w-[120px] h-[60px] flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded text-white/50 text-xs text-center p-2">
            <div className="text-[8px] mb-1">📐</div>
            <div className="text-[8px]">Logo</div>
            <div className="text-[8px] opacity-60 mt-1">{logo.brand}</div>
          </div>
        )}
        <div className="flex-1 flex flex-col gap-1">
          {logo.figmaLink && (
            <a
              href={logo.figmaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-xs text-center"
            >
              🔗 View in Figma
            </a>
          )}
          {logo.downloadUrl && (
            <a
              href={logo.downloadUrl}
              download
              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white/80 text-xs text-center"
            >
              ⬇️ Download
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

