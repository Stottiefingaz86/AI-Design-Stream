/**
 * TextWithMarkups Component
 * 
 * Renders text with visual markups for:
 * - Statistics/metrics (e.g., "75%", "3.8/5", "150 reviews")
 * - Key phrases (e.g., "Key Finding:", "Recommendation:", "Insight:")
 * - Bold/italic text (**, *, __, _)
 * - Code blocks (`code`)
 * - Lists (numbered, bulleted)
 */

import React from 'react'
import { motion } from 'framer-motion'

export function formatTextWithMarkups(text: string): JSX.Element {
  const elements: JSX.Element[] = []
  const lines = text.split('\n')
  let keyCounter = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    if (!trimmed) {
      // Empty line
      if (i > 0 && i < lines.length - 1) {
        elements.push(<div key={`empty-${keyCounter++}`} className="h-2" />)
      }
      continue
    }
    
    // Check for headings (### Heading or ==== separator)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const headingText = headingMatch[2]
      elements.push(
        <h3
          key={`heading-${keyCounter++}`}
          className={`mt-4 mb-2 text-white font-semibold ${
            level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'
          }`}
        >
          {headingText}
        </h3>
      )
      continue
    }
    
    // Check for key phrases at start of line (e.g., "Key Finding:", "Recommendation:")
    const keyPhraseMatch = trimmed.match(/^(Key Finding|Finding|Recommendation|Insight|Statistic|Metric|Important|Note|Summary|Conclusion|Key Insight|Action Item):\s*(.+)$/i)
    if (keyPhraseMatch) {
      const label = keyPhraseMatch[1]
      const content = keyPhraseMatch[2]
      elements.push(
        <div key={`keyphrase-${keyCounter++}`} className="mt-2 first:mt-0">
          <div className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-1">
            {label}
          </div>
          <div className="text-white/90 text-sm border-l-2 border-white/30 pl-3 py-1">
            {formatInlineMarkups(content)}
          </div>
        </div>
      )
      continue
    }
    
    // Check for bullet/numbered lists
    const listMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (listMatch) {
      const number = listMatch[1]
      const content = listMatch[2]
      // Make numbered list items clickable
      elements.push(
        <motion.button
          key={`list-${keyCounter++}`}
          onClick={() => {
            // Send the list item text as a message
            const event = new CustomEvent('clickSuggestion', { detail: content })
            window.dispatchEvent(event)
          }}
          className="mt-1 w-full text-left flex items-start gap-2 text-white/80 text-sm p-2 rounded-lg hover:bg-white/5 transition-all neu-flat border border-white/10"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="text-white/40 mt-0.5 font-medium">{number}.</span>
          <span className="flex-1">{formatInlineMarkups(content)}</span>
        </motion.button>
      )
      continue
    }
    
    // Check for bullet lists (non-numbered) - make them clickable too
    const bulletMatch = trimmed.match(/^[•\-]\s+(.+)$/)
    if (bulletMatch) {
      const content = bulletMatch[1]
      // Make bullet list items clickable
      elements.push(
        <motion.button
          key={`list-${keyCounter++}`}
          onClick={() => {
            // Send the list item text as a message
            const event = new CustomEvent('clickSuggestion', { detail: content })
            window.dispatchEvent(event)
          }}
          className="mt-1 w-full text-left flex items-start gap-2 text-white/80 text-sm p-2 rounded-lg hover:bg-white/5 transition-all neu-flat border border-white/10"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="text-white/40 mt-0.5">•</span>
          <span className="flex-1">{formatInlineMarkups(content)}</span>
        </motion.button>
      )
      continue
    }
    
    // Regular paragraph with inline markups
    elements.push(
      <p key={`para-${keyCounter++}`} className="mt-1 first:mt-0 text-white/70 text-sm leading-relaxed">
        {formatInlineMarkups(trimmed)}
      </p>
    )
  }
  
  return <>{elements}</>
}

// Format inline markups (statistics, emphasis, code)
function formatInlineMarkups(text: string): JSX.Element {
  const parts: (string | JSX.Element)[] = []
  let keyCounter = 0
  
  // Split by emphasis patterns first (**bold**, *italic*, __bold__, _italic_)
  const emphasisRegex = /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_/g
  let lastIndex = 0
  let match
  
  emphasisRegex.lastIndex = 0
  
  while ((match = emphasisRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Determine if bold or italic
    const isBold = match[0].startsWith('**') || match[0].startsWith('__')
    const content = match[1] || match[2] || match[3] || match[4]
    
    parts.push(
      <span
        key={`emphasis-${keyCounter++}`}
        className={isBold ? 'font-semibold text-white' : 'italic text-white/90'}
      >
        {formatStatistics(content)}
      </span>
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  // If no emphasis found, just format statistics
  if (parts.length === 0) {
    return formatStatistics(text)
  }
  
  // Process remaining parts for statistics
  const processedParts: (string | JSX.Element)[] = []
  for (const part of parts) {
    if (typeof part === 'string') {
      processedParts.push(formatStatistics(part))
    } else {
      processedParts.push(part)
    }
  }
  
  return <>{processedParts}</>
}

// Format statistics (percentages, ratings, counts)
function formatStatistics(text: string): JSX.Element {
  // Match statistics: percentages, ratings (x/y), counts (N reviews, N respondents, etc.)
  const statRegex = /(\d+(?:\.\d+)?%\s+|\d+(?:\.\d+)?\/\d+\s+|\d+\s+(?:reviews?|respondents?|findings?|issues?|users?|participants?)\s+)/gi
  const parts: (string | JSX.Element)[] = []
  let keyCounter = 0
  let lastIndex = 0
  let match
  
  statRegex.lastIndex = 0
  
  while ((match = statRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Highlight statistic
    parts.push(
      <span
        key={`stat-${keyCounter++}`}
        className="px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-medium text-xs font-mono border border-yellow-400/30"
      >
        {match[0].trim()}
      </span>
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  // Format code blocks within text
  const finalParts: (string | JSX.Element)[] = []
  for (const part of parts) {
    if (typeof part === 'string') {
      finalParts.push(formatCode(part))
    } else {
      finalParts.push(part)
    }
  }
  
  return <>{finalParts}</>
}

// Format inline code (`code`)
function formatCode(text: string): JSX.Element {
  const codeRegex = /`([^`]+)`/g
  const parts: (string | JSX.Element)[] = []
  let keyCounter = 0
  let lastIndex = 0
  let match
  
  codeRegex.lastIndex = 0
  
  while ((match = codeRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    // Code block
    parts.push(
      <code
        key={`code-${keyCounter++}`}
        className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-white/90 border border-white/10"
      >
        {match[1]}
      </code>
    )
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return <>{parts}</>
}
