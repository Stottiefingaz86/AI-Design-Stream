'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

export function SceneUserRequest() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const setUserRequest = useSceneStore((state) => state.setUserRequest)
  const triggerKool = useSceneStore((state) => state.triggerKool)
  const nextScene = useSceneStore((state) => state.nextScene)
  
  const [what, setWhat] = useState(userRequest.what || '')
  const [why, setWhy] = useState(userRequest.why || '')
  const [context, setContext] = useState(userRequest.context || '')
  const [goals, setGoals] = useState(userRequest.goals || '')
  const [useCases, setUseCases] = useState(userRequest.useCases || '')
  const [currentField, setCurrentField] = useState<'what' | 'why' | 'context' | 'goals' | 'useCases'>('what')
  
  // Refs for input fields
  const whatInputRef = useRef<HTMLInputElement>(null)
  const whyInputRef = useRef<HTMLInputElement>(null)
  const contextInputRef = useRef<HTMLInputElement>(null)
  const goalsInputRef = useRef<HTMLInputElement>(null)
  const useCasesInputRef = useRef<HTMLInputElement>(null)

  // Focus current field input
  useEffect(() => {
    const refs = {
      what: whatInputRef,
      why: whyInputRef,
      context: contextInputRef,
      goals: goalsInputRef,
      useCases: useCasesInputRef,
    }
    const currentRef = refs[currentField]
    if (currentRef?.current) {
      setTimeout(() => currentRef.current?.focus(), 100)
    }
  }, [currentField])

  const handleFieldSubmit = (field: 'what' | 'why' | 'context' | 'goals' | 'useCases', value: string) => {
    if (!value.trim()) return

    // Update local state
    if (field === 'what') setWhat(value.trim())
    if (field === 'why') setWhy(value.trim())
    if (field === 'context') setContext(value.trim())
    if (field === 'goals') setGoals(value.trim())
    if (field === 'useCases') setUseCases(value.trim())

    // Update store
    const updatedRequest = { ...userRequest, what, why, context, goals, useCases }
    updatedRequest[field] = value.trim()
    setUserRequest(updatedRequest)

    // Move to next field or complete
    if (field === 'what') {
      setCurrentField('why')
      triggerKool()
    } else if (field === 'why') {
      setCurrentField('context')
      triggerKool()
    } else if (field === 'context') {
      setCurrentField('goals')
      triggerKool()
    } else if (field === 'goals') {
      setCurrentField('useCases')
      triggerKool()
    } else if (field === 'useCases') {
      // All fields done, trigger kool and move to next scene
      triggerKool()
      setTimeout(() => {
        nextScene()
      }, 500)
    }
  }

  const handleFieldEdit = (field: 'what' | 'why' | 'context' | 'goals' | 'useCases') => {
    setCurrentField(field)
  }

  const handleSkip = () => {
    // Skip optional fields based on current field
    if (currentField === 'context') {
      setCurrentField('goals')
    } else if (currentField === 'goals') {
      setCurrentField('useCases')
    } else if (currentField === 'useCases') {
      // Done, move to next scene
      triggerKool()
      setTimeout(() => {
        const updatedRequest = { ...userRequest, what, why, context, goals, useCases }
        setUserRequest(updatedRequest)
        setTimeout(() => {
          nextScene()
        }, 500)
      }, 100)
    }
  }

  const getFieldConfig = (field: 'what' | 'why' | 'context' | 'goals' | 'useCases') => {
    switch (field) {
      case 'what':
        return {
          label: 'What do you need?',
          placeholder: 'Describe what you need designed...',
          description: 'Be specific about what you need in the ' + requestArea + ' area',
        }
      case 'why':
        return {
          label: 'Why is this needed?',
          placeholder: 'Explain why this is needed...',
          description: 'Help us understand the purpose and motivation',
        }
      case 'context':
        return {
          label: 'What\'s the context? (optional)',
          placeholder: 'Provide any relevant context...',
          description: 'Any background information that would be helpful',
        }
      case 'goals':
        return {
          label: 'What are the goals? (optional)',
          placeholder: 'What should this achieve?',
          description: 'What outcomes are you hoping to achieve?',
        }
      case 'useCases':
        return {
          label: 'Would you like to add some use cases? (optional)',
          placeholder: 'Describe specific use cases or scenarios...',
          description: 'Specific scenarios or examples of how this will be used',
        }
    }
  }

  const casinoFrequentRequests = [
    'Casino tile',
    'Icon request',
    'Full flipping redesign',
  ]

  const handleTagClick = (tag: string) => {
    if (currentField === 'what') {
      setWhat(tag)
      // Auto-submit the tag
      handleFieldSubmit('what', tag)
    }
  }

  const renderField = (field: 'what' | 'why' | 'context' | 'goals' | 'useCases') => {
    const config = getFieldConfig(field)
    const value = field === 'what' ? what : field === 'why' ? why : field === 'context' ? context : field === 'goals' ? goals : useCases
    const isActive = currentField === field
    const isCompleted = !!value
    const isOptional = ['context', 'goals', 'useCases'].includes(field)
    const inputRef = field === 'what' ? whatInputRef : field === 'why' ? whyInputRef : field === 'context' ? contextInputRef : field === 'goals' ? goalsInputRef : useCasesInputRef

    return (
      <motion.div
        key={field}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-white text-2xl font-bold mb-2 sf-title">{config.label}</h2>
        <p className="text-white/50 text-sm font-light mb-4">
          {config.description}
        </p>

        {/* Frequent request tags for Casino - What field only */}
        {field === 'what' && requestArea === 'Casino' && !value && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <p className="text-white/40 text-xs font-light mb-3">Frequent requests:</p>
            <div className="flex flex-wrap gap-2">
              {casinoFrequentRequests.map((tag, index) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setWhat(tag)
                    handleFieldSubmit('what', tag)
                  }}
                  className="px-4 py-2 neu-flat rounded-lg text-white/70 text-sm font-light hover:neu-inset hover:text-white transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Always show input field when this is the active field */}
        <div className="space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (value.trim()) {
                handleFieldSubmit(field, value)
              }
            }}
          >
            <div className="neu-soft rounded-xl p-3">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => {
                  if (field === 'what') setWhat(e.target.value)
                  if (field === 'why') setWhy(e.target.value)
                  if (field === 'context') setContext(e.target.value)
                  if (field === 'goals') setGoals(e.target.value)
                  if (field === 'useCases') setUseCases(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (value.trim()) {
                      handleFieldSubmit(field, value)
                    }
                  }
                }}
                placeholder={config.placeholder}
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm font-light focus:outline-none"
                autoFocus={isActive}
              />
            </div>
          </form>
          {isOptional && isActive && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
                onClick={handleSkip}
              className="text-white/40 text-xs font-light hover:text-white/60 transition-colors"
            >
              Skip
            </motion.button>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Progress indicator */}
      <div className="p-4 md:p-6 pb-4">
        <div className="flex gap-2 mb-4">
          {['what', 'why', 'context', 'goals', 'useCases'].map((field) => {
            const fieldKey = field as 'what' | 'why' | 'context' | 'goals' | 'useCases'
            const value = fieldKey === 'what' ? what : fieldKey === 'why' ? why : fieldKey === 'context' ? context : fieldKey === 'goals' ? goals : useCases
            return (
              <div
                key={field}
                className={`h-1 flex-1 rounded ${
                  currentField === field
                    ? 'bg-white'
                    : ['what', 'why'].includes(field) && value
                    ? 'bg-white/50'
                    : ['context', 'goals', 'useCases'].includes(field) && value
                    ? 'bg-white/30'
                    : 'bg-white/10'
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Questions with individual inputs - show one at a time */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6">
        {/* Show completed fields as summary cards */}
        {what && currentField !== 'what' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleFieldEdit('what')}
            className="neu-soft rounded-xl p-3 md:p-4 mb-3 md:mb-4 cursor-pointer hover:neu-inset active:neu-inset transition-all"
          >
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">What</p>
            <p className="text-white/80 text-sm font-light">{what}</p>
          </motion.div>
        )}
        {why && currentField !== 'why' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleFieldEdit('why')}
            className="neu-soft rounded-xl p-3 md:p-4 mb-3 md:mb-4 cursor-pointer hover:neu-inset active:neu-inset transition-all"
          >
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Why</p>
            <p className="text-white/80 text-sm font-light">{why}</p>
          </motion.div>
        )}
        {context && currentField !== 'context' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleFieldEdit('context')}
            className="neu-soft rounded-xl p-3 md:p-4 mb-3 md:mb-4 cursor-pointer hover:neu-inset active:neu-inset transition-all"
          >
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Context</p>
            <p className="text-white/80 text-sm font-light">{context}</p>
          </motion.div>
        )}
        {goals && currentField !== 'goals' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleFieldEdit('goals')}
            className="neu-soft rounded-xl p-3 md:p-4 mb-3 md:mb-4 cursor-pointer hover:neu-inset active:neu-inset transition-all"
          >
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Goals</p>
            <p className="text-white/80 text-sm font-light">{goals}</p>
          </motion.div>
        )}
        {useCases && currentField !== 'useCases' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleFieldEdit('useCases')}
            className="neu-soft rounded-xl p-3 md:p-4 mb-3 md:mb-4 cursor-pointer hover:neu-inset active:neu-inset transition-all"
          >
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Use Cases</p>
            <p className="text-white/80 text-sm font-light">{useCases}</p>
          </motion.div>
        )}

        {/* Show current field with input */}
        {renderField(currentField)}
      </div>
    </div>
  )
}
