'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStudioStore } from '@/lib/store/studioStore'
import { fadeIn } from '@/lib/motion/transitions'

export function ChatPanel() {
  const phase = useStudioStore((state) => state.phase)
  const setBriefData = useStudioStore((state) => state.setBriefData)
  const submitBrief = useStudioStore((state) => state.submitBrief)

  const [brandName, setBrandName] = useState('')
  const [industry, setIndustry] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [adjectives, setAdjectives] = useState<string[]>([])
  const [currentAdjective, setCurrentAdjective] = useState('')
  const [competitors, setCompetitors] = useState<string[]>([])
  const [currentCompetitor, setCurrentCompetitor] = useState('')
  const [moodPreference, setMoodPreference] = useState('')

  const moodOptions = [
    'Professional',
    'Playful',
    'Bold',
    'Minimal',
    'Warm',
    'Modern',
  ]

  const handleAddAdjective = () => {
    if (currentAdjective.trim() && adjectives.length < 3) {
      setAdjectives([...adjectives, currentAdjective.trim()])
      setCurrentAdjective('')
    }
  }

  const handleRemoveAdjective = (index: number) => {
    setAdjectives(adjectives.filter((_, i) => i !== index))
  }

  const handleAddCompetitor = () => {
    if (currentCompetitor.trim()) {
      setCompetitors([...competitors, currentCompetitor.trim()])
      setCurrentCompetitor('')
    }
  }

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    setBriefData({
      brandName: brandName || 'Help me name it',
      industry,
      targetAudience,
      adjectives,
      competitors,
      moodPreference,
    })
    submitBrief()
  }

  if (phase !== 'briefing') {
    return (
      <div className="flex-1 border-r border-white/20 bg-black p-6 overflow-y-auto">
        <div className="text-white/60">Interaction panel</div>
      </div>
    )
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex-1 border-r border-white/20 bg-black p-6 overflow-y-auto"
    >
      <h2 className="text-xl font-bold mb-6">Brief</h2>

      <div className="space-y-6">
        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Brand Name</label>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Or type 'help me name it'"
            className="w-full px-4 py-3 bg-black border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium mb-2">Industry</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., SaaS, E-commerce, Healthcare"
            className="w-full px-4 py-3 bg-black border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium mb-2">Target Audience</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Tech-savvy professionals, Creative entrepreneurs"
            className="w-full px-4 py-3 bg-black border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
          />
        </div>

        {/* 3 Adjectives */}
        <div>
          <label className="block text-sm font-medium mb-2">
            3 Adjectives (required)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentAdjective}
              onChange={(e) => setCurrentAdjective(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddAdjective()}
              placeholder="Add adjective"
              disabled={adjectives.length >= 3}
              className="flex-1 px-4 py-3 bg-black border border-white/20 rounded focus:outline-none focus:border-white transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleAddAdjective}
              disabled={adjectives.length >= 3 || !currentAdjective.trim()}
              className="px-4 border border-white/20 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {adjectives.map((adj, i) => (
              <div
                key={i}
                className="px-3 py-1 border border-white/20 rounded flex items-center gap-2"
              >
                <span>{adj}</span>
                <button
                  onClick={() => handleRemoveAdjective(i)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Competitors (optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Competitors (optional)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentCompetitor}
              onChange={(e) => setCurrentCompetitor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCompetitor()}
              placeholder="Add competitor"
              className="flex-1 px-4 py-3 bg-black border border-white/20 rounded focus:outline-none focus:border-white transition-colors"
            />
            <button
              onClick={handleAddCompetitor}
              disabled={!currentCompetitor.trim()}
              className="px-4 border border-white/20 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {competitors.map((comp, i) => (
              <div
                key={i}
                className="px-3 py-1 border border-white/20 rounded flex items-center gap-2"
              >
                <span>{comp}</span>
                <button
                  onClick={() => handleRemoveCompetitor(i)}
                  className="text-white/60 hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Preference */}
        <div>
          <label className="block text-sm font-medium mb-2">Mood Preference</label>
          <div className="grid grid-cols-3 gap-2">
            {moodOptions.map((mood) => (
              <button
                key={mood}
                onClick={() => setMoodPreference(mood)}
                className={`px-4 py-2 border rounded transition-colors ${
                  moodPreference === mood
                    ? 'border-white bg-white/10'
                    : 'border-white/20 hover:bg-white/5'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          onClick={handleSubmit}
          disabled={!industry || !targetAudience || adjectives.length < 3}
          className="w-full py-4 border-2 border-white rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Submit Brief
        </motion.button>
      </div>
    </motion.div>
  )
}
