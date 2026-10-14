/**
 * Figma Design System Extractor
 * 
 * This file helps extract design system information from Figma.
 * You can either:
 * 1. Use Figma MCP tools (if file is open in Figma desktop)
 * 2. Export tokens from Figma and paste them here
 * 3. Manually add information based on your Figma file
 */

export interface FigmaTokens {
  colors?: {
    [key: string]: {
      value: string
      type: 'color'
      description?: string
    }
  }
  typography?: {
    [key: string]: {
      fontFamily?: string
      fontSize?: string
      fontWeight?: string
      lineHeight?: string
      letterSpacing?: string
    }
  }
  spacing?: {
    [key: string]: {
      value: string
      type: 'dimension'
    }
  }
  borderRadius?: {
    [key: string]: {
      value: string
      type: 'borderRadius'
    }
  }
  shadows?: {
    [key: string]: {
      value: string
      type: 'shadow'
    }
  }
}

/**
 * Convert Figma tokens to our DesignSystemInfo format
 * Supports agnostic design system with multi-brand structure
 */
export function convertFigmaTokensToDesignSystem(tokens: FigmaTokens, brandName?: string) {
  const designSystem: any = {
    colors: {
      primary: [],
      secondary: [],
      neutral: [],
      semantic: {},
    },
    typography: {
      fontFamilies: {
        primary: '',
        secondary: '',
        mono: '',
      },
      scales: {
        heading: [],
        body: [],
      },
      weights: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
      },
    },
    spacing: {
      scale: [],
      unit: 'px',
      grid: {
        columns: 12,
        gutter: 16,
        margin: 24,
      },
    },
    borderRadius: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    shadows: {},
    components: {},
    patterns: {},
    brands: {},
    areas: {},
    principles: [],
    goals: [],
    vision: '',
  }

  // Extract colors (shared/base colors)
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, value]) => {
      const colorValue = value.value
      const keyLower = key.toLowerCase()
      
      // Check if this is a brand-specific color
      const brandMatch = keyLower.match(/(casino|sports|loyalty|authentication|poker|auth)/)
      if (brandMatch && brandName) {
        // This is a brand-specific color, we'll handle it separately
        return
      }
      
      // Shared/base colors
      if (keyLower.includes('primary')) {
        designSystem.colors.primary.push(colorValue)
      } else if (keyLower.includes('secondary')) {
        designSystem.colors.secondary.push(colorValue)
      } else if (keyLower.includes('neutral') || keyLower.includes('gray') || keyLower.includes('grey')) {
        designSystem.colors.neutral.push(colorValue)
      } else if (keyLower.includes('success')) {
        designSystem.colors.semantic.success = colorValue
      } else if (keyLower.includes('warning')) {
        designSystem.colors.semantic.warning = colorValue
      } else if (keyLower.includes('error') || keyLower.includes('danger')) {
        designSystem.colors.semantic.error = colorValue
      } else if (keyLower.includes('info')) {
        designSystem.colors.semantic.info = colorValue
      }
    })
    
    // Extract brand-specific colors if brandName is provided
    if (brandName) {
      const brandColors: any = {
        primary: [],
        secondary: [],
        accent: [],
        neutral: [],
      }
      
      Object.entries(tokens.colors).forEach(([key, value]) => {
        const keyLower = key.toLowerCase()
        if (keyLower.includes(brandName.toLowerCase())) {
          if (keyLower.includes('primary')) {
            brandColors.primary.push(value.value)
          } else if (keyLower.includes('secondary')) {
            brandColors.secondary.push(value.value)
          } else if (keyLower.includes('accent')) {
            brandColors.accent.push(value.value)
          } else if (keyLower.includes('neutral')) {
            brandColors.neutral.push(value.value)
          }
        }
      })
      
      if (Object.keys(brandColors).length > 0) {
        designSystem.brands[brandName] = {
          name: brandName,
          colors: brandColors,
        }
      }
    }
  }

  // Extract typography
  if (tokens.typography) {
    const fontFamilies = new Set<string>()
    const fontSizes = new Set<string>()
    
    Object.values(tokens.typography).forEach((type) => {
      if (type.fontFamily) fontFamilies.add(type.fontFamily)
      if (type.fontSize) fontSizes.add(type.fontSize)
    })
    
    const fontArray = Array.from(fontFamilies)
    designSystem.typography.fontFamilies.primary = fontArray[0] || ''
    designSystem.typography.fontFamilies.secondary = fontArray[1] || ''
    designSystem.typography.fontFamilies.mono = fontArray[2] || ''
    
    const sizes = Array.from(fontSizes).map(s => parseFloat(s)).filter(v => !isNaN(v)).sort((a, b) => b - a)
    // Split into heading and body scales (assuming larger = headings)
    const midpoint = Math.floor(sizes.length / 2)
    designSystem.typography.scales.heading = sizes.slice(0, midpoint)
    designSystem.typography.scales.body = sizes.slice(midpoint)
  }

  // Extract spacing
  if (tokens.spacing) {
    const spacingValues = Object.values(tokens.spacing)
      .map(s => parseFloat(s.value))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b)
    
    designSystem.spacing.scale = spacingValues
  }

  // Extract border radius
  if (tokens.borderRadius) {
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      const keyLower = key.toLowerCase()
      if (keyLower.includes('none') || keyLower === '0') {
        designSystem.borderRadius.none = value.value
      } else if (keyLower.includes('sm') || keyLower.includes('small')) {
        designSystem.borderRadius.sm = value.value
      } else if (keyLower.includes('md') || keyLower.includes('medium')) {
        designSystem.borderRadius.md = value.value
      } else if (keyLower.includes('lg') || keyLower.includes('large')) {
        designSystem.borderRadius.lg = value.value
      } else if (keyLower.includes('xl') || keyLower.includes('xlarge')) {
        designSystem.borderRadius.xl = value.value
      } else if (keyLower.includes('full') || keyLower.includes('round')) {
        designSystem.borderRadius.full = value.value
      }
    })
  }

  // Extract shadows
  if (tokens.shadows) {
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      const keyLower = key.toLowerCase()
      if (keyLower.includes('sm') || keyLower.includes('small')) {
        designSystem.shadows.sm = value.value
      } else if (keyLower.includes('md') || keyLower.includes('medium')) {
        designSystem.shadows.md = value.value
      } else if (keyLower.includes('lg') || keyLower.includes('large')) {
        designSystem.shadows.lg = value.value
      } else if (keyLower.includes('xl') || keyLower.includes('xlarge')) {
        designSystem.shadows.xl = value.value
      }
    })
  }

  return designSystem
}
