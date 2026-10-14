'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

const designStyles = [
  { 
    name: 'Neumorphic', 
    description: 'Soft shadows, subtle depth, tactile feel',
    keywords: ['Soft', 'Tactile', 'Modern', 'Minimal'],
    example: 'neumorphic'
  },
  { 
    name: 'Glassmorphism', 
    description: 'Frosted glass effects, transparency, depth',
    keywords: ['Transparent', 'Layered', 'Elegant', 'Depth'],
    example: 'glassmorphism'
  },
  { 
    name: 'Minimal', 
    description: 'Clean lines, white space, simplicity',
    keywords: ['Clean', 'Simple', 'Focused', 'Elegant'],
    example: 'minimal'
  },
  { 
    name: 'Bold & Geometric', 
    description: 'Strong shapes, high contrast, impactful',
    keywords: ['Bold', 'Geometric', 'Striking', 'Confident'],
    example: 'geometric'
  },
  { 
    name: 'Organic', 
    description: 'Curved shapes, natural flow, fluid',
    keywords: ['Organic', 'Fluid', 'Natural', 'Smooth'],
    example: 'organic'
  },
  { 
    name: 'Retro', 
    description: 'Nostalgic, vintage-inspired, character',
    keywords: ['Vintage', 'Nostalgic', 'Character', 'Warm'],
    example: 'retro'
  },
]

// Component to render design style examples
function DesignStyleExample({ style }: { style: string }) {
  if (style === 'neumorphic') {
    return (
      <div className="space-y-3">
        <div className="neu-soft rounded-xl p-4">
          <div className="text-white text-sm font-light">Neumorphic Card</div>
          <div className="text-white/60 text-xs mt-2">Soft shadows create depth</div>
        </div>
        <div className="neu-flat rounded-xl p-4">
          <div className="text-white text-sm font-light">Flat Variant</div>
          <div className="text-white/60 text-xs mt-2">Subtle elevation</div>
        </div>
        <div className="neu-inset rounded-xl p-4">
          <div className="text-white text-sm font-light">Inset Variant</div>
          <div className="text-white/60 text-xs mt-2">Pressed appearance</div>
        </div>
      </div>
    )
  }

  if (style === 'retro') {
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 border-2 border-white/30" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.5)'
        }}>
          <div className="text-white text-sm font-light" style={{ fontFamily: 'monospace' }}>RETRO STYLE</div>
          <div className="text-white/60 text-xs mt-2" style={{ fontFamily: 'monospace' }}>Vintage aesthetic</div>
        </div>
        <div className="rounded-xl p-4 border-2 border-dashed border-white/20" style={{
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 10px, transparent 10px, transparent 20px)'
        }}>
          <div className="text-white text-sm font-light">Pattern Background</div>
          <div className="text-white/60 text-xs mt-2">Nostalgic textures</div>
        </div>
        <div className="rounded-xl p-4" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '3px solid rgba(255,255,255,0.3)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.1) inset'
        }}>
          <div className="text-white text-sm font-light">Bold Borders</div>
          <div className="text-white/60 text-xs mt-2">Classic retro feel</div>
        </div>
      </div>
    )
  }

  if (style === 'glassmorphism') {
    return (
      <div className="space-y-3">
        <div className="glass-soft rounded-xl p-4 border border-white/10">
          <div className="text-white text-sm font-light">Glass Card</div>
          <div className="text-white/60 text-xs mt-2">Frosted transparency</div>
        </div>
        <div className="rounded-xl p-4" style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div className="text-white text-sm font-light">Layered Depth</div>
          <div className="text-white/60 text-xs mt-2">Multi-level transparency</div>
        </div>
      </div>
    )
  }

  if (style === 'minimal') {
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 border border-white/10">
          <div className="text-white text-sm font-light">Clean Card</div>
          <div className="text-white/60 text-xs mt-2">Simple borders</div>
        </div>
        <div className="rounded-xl p-4">
          <div className="text-white text-sm font-light">White Space</div>
          <div className="text-white/60 text-xs mt-2">Generous spacing</div>
        </div>
      </div>
    )
  }

  if (style === 'geometric') {
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 border-2 border-white/40" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 100%)'
        }}>
          <div className="text-white text-sm font-bold">BOLD SHAPES</div>
          <div className="text-white/60 text-xs mt-2">High contrast</div>
        </div>
        <div className="rounded-xl p-4" style={{
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.3)',
          clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'
        }}>
          <div className="text-white text-sm font-light">Geometric Forms</div>
          <div className="text-white/60 text-xs mt-2">Angular design</div>
        </div>
      </div>
    )
  }

  if (style === 'organic') {
    return (
      <div className="space-y-3">
        <div className="rounded-3xl p-4 border border-white/10" style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
        }}>
          <div className="text-white text-sm font-light">Curved Shapes</div>
          <div className="text-white/60 text-xs mt-2">Natural flow</div>
        </div>
        <div className="rounded-2xl p-4" style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '2rem 0.5rem 2rem 0.5rem'
        }}>
          <div className="text-white text-sm font-light">Organic Forms</div>
          <div className="text-white/60 text-xs mt-2">Fluid boundaries</div>
        </div>
      </div>
    )
  }

  return null
}

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneDesignStyle() {
  const designStyle = ''
  const setDesignStyle = (_value: string) => {}
  const goToScene = useSceneStore((state) => state.goToScene)
  const triggerKool = useSceneStore((state) => state.triggerKool)

  const handleSelectDesignStyle = (style: string) => {
    triggerKool()
    setDesignStyle(style)
  }

  const handleContinue = () => {
    if (designStyle) {
      // Deprecated scene - do nothing
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question and content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2 sf-title">Choose your design style</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            💡 Select a design aesthetic that defines how your design will look and feel
          </p>
        </div>

        {/* Design Style Selection */}
        <div className="space-y-4">
          {designStyles.map((style, index) => {
            const isSelected = designStyle === style.name
            return (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <motion.button
                  onClick={() => handleSelectDesignStyle(style.name)}
                  className={`w-full text-left transition-all ${
                    isSelected ? 'ring-2 ring-white/50' : ''
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`neu-soft rounded-xl p-4 ${isSelected ? 'neu-inset' : 'hover:neu-inset'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white text-base font-light">{style.name}</h4>
                      {isSelected && (
                        <span className="text-white/80 text-sm">✓</span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mb-3 font-light">{style.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {style.keywords.map((keyword, i) => (
                        <span key={i} className="px-2 py-1 neu-flat rounded text-xs text-white/70">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    {/* Show example preview */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-white/40 text-xs mb-2">Preview:</p>
                      <DesignStyleExample style={style.example} />
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Continue button */}
      {designStyle && (
        <div className="border-t border-white/5 p-4">
          <motion.button
            onClick={handleContinue}
            className="w-full px-6 py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </div>
      )}
    </div>
  )
}
