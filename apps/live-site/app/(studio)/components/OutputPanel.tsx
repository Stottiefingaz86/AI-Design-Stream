'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useStudioStore } from '@/lib/store/studioStore'
import { AgencyCard } from './AgencyCard'
import { ResearchBoard } from './ResearchBoard'
import { DeliverablesVault } from './DeliverablesVault'
import { staggerContainer, staggerItem, fadeIn, slideUp } from '@/lib/motion/transitions'

export function OutputPanel() {
  const phase = useStudioStore((state) => state.phase)
  const researchData = useStudioStore((state) => state.researchData)
  const brandPillars = useStudioStore((state) => state.brandPillars)
  const positioning = useStudioStore((state) => state.positioning)
  const taglineOptions = useStudioStore((state) => state.taglineOptions)
  const creativeDirections = useStudioStore((state) => state.creativeDirections)
  const brandSystem = useStudioStore((state) => state.brandSystem)

  const approvePillar = useStudioStore((state) => state.approvePillar)
  const approvePositioning = useStudioStore((state) => state.approvePositioning)
  const approveTagline = useStudioStore((state) => state.approveTagline)
  const selectDirection = useStudioStore((state) => state.selectDirection)
  const approveStrategy = useStudioStore((state) => state.approveStrategy)
  const approveCreativeDirection = useStudioStore((state) => state.approveCreativeDirection)
  const approvePalette = useStudioStore((state) => state.approvePalette)
  const approveTypography = useStudioStore((state) => state.approveTypography)
  const approveToneOfVoice = useStudioStore((state) => state.approveToneOfVoice)
  const approveProduction = useStudioStore((state) => state.approveProduction)

  // Check completion states
  const strategyComplete =
    brandPillars.length > 0 &&
    brandPillars.every((p) => p.approved) &&
    positioning?.approved &&
    taglineOptions.some((t) => t.approved)

  const productionComplete =
    brandSystem?.palette.approved &&
    brandSystem?.typography.approved &&
    brandSystem?.toneOfVoice.approved

  return (
    <div className="flex-1 bg-black p-6 overflow-y-auto">
      <AnimatePresence mode="wait">
        {phase === 'briefing' && (
          <motion.div
            key="briefing"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-full flex items-center justify-center"
          >
            <div className="text-center text-white/40">
              <p>Complete your brief to begin</p>
            </div>
          </motion.div>
        )}

        {phase === 'researching' && researchData && (
          <motion.div
            key="researching"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Research Board</h2>
              <p className="text-white/60">Category analysis and competitor insights</p>
            </div>
            <ResearchBoard research={researchData} />
          </motion.div>
        )}

        {phase === 'synthesizing' && (
          <motion.div
            key="synthesizing"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Strategy</h2>
              <p className="text-white/60">Review and approve your brand strategy</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Brand Pillars</h3>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {brandPillars.map((pillar) => (
                  <motion.div key={pillar.id} variants={staggerItem}>
                    <AgencyCard
                      title={pillar.name}
                      rationale={pillar.rationale}
                      approved={pillar.approved}
                      onApprove={() => approvePillar(pillar.id)}
                    >
                      <p className="text-white/80">{pillar.description}</p>
                    </AgencyCard>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {positioning && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Positioning</h3>
                <AgencyCard
                  title="Brand Positioning Statement"
                  rationale={positioning.rationale}
                  approved={positioning.approved}
                  onApprove={approvePositioning}
                >
                  <p className="text-white/80 text-lg leading-relaxed">
                    {positioning.statement}
                  </p>
                </AgencyCard>
              </div>
            )}

            {taglineOptions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Tagline Options</h3>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {taglineOptions.map((tagline) => (
                    <motion.div key={tagline.id} variants={staggerItem}>
                      <AgencyCard
                        title={tagline.text}
                        rationale={tagline.rationale}
                        approved={tagline.approved}
                        onApprove={() => approveTagline(tagline.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {strategyComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-center"
              >
                <motion.button
                  onClick={approveStrategy}
                  className="px-8 py-4 border-2 border-white hover:bg-white hover:text-black transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Approve Strategy →
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'presenting' && (
          <motion.div
            key="presenting"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Creative Directions</h2>
              <p className="text-white/60">Select your visual direction</p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {creativeDirections.map((direction) => (
                <motion.div key={direction.id} variants={staggerItem}>
                  <AgencyCard
                    title={direction.name}
                    rationale={direction.strategicIntent}
                    approved={direction.selected}
                    onApprove={() => selectDirection(direction.id)}
                  >
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-white/60 mb-1">Mood Keywords</div>
                        <div className="flex flex-wrap gap-1">
                          {direction.moodKeywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs border border-white/20"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60 mb-1">Visual Direction</div>
                        <p className="text-sm text-white/80">{direction.visualDirection}</p>
                      </div>
                      <div>
                        <div className="text-xs text-white/60 mb-1">Copy Direction</div>
                        <p className="text-sm text-white/80">{direction.copyDirection}</p>
                      </div>
                    </div>
                  </AgencyCard>
                </motion.div>
              ))}
            </motion.div>

            {creativeDirections.some((d) => d.selected) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-center"
              >
                <motion.button
                  onClick={approveCreativeDirection}
                  className="px-8 py-4 border-2 border-white hover:bg-white hover:text-black transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Lock Direction →
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'generating' && brandSystem && (
          <motion.div
            key="generating"
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Brand System</h2>
              <p className="text-white/60">Finalize your brand elements</p>
            </div>

            {/* Logo Direction */}
            {brandSystem.logoDirection && (
              <AgencyCard
                title="Logo Direction"
                rationale={brandSystem.logoDirection.rationale}
                showApprove={false}
              >
                <p className="text-white/80">{brandSystem.logoDirection.notes}</p>
              </AgencyCard>
            )}

            {/* Palette */}
            <AgencyCard
              title="Color Palette"
              rationale={brandSystem.palette.rationale}
              approved={brandSystem.palette.approved}
              onApprove={approvePalette}
            >
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/60 mb-2">Primary</div>
                  <div className="flex gap-2">
                    {brandSystem.palette.primary.map((color, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-2">Secondary</div>
                  <div className="flex gap-2">
                    {brandSystem.palette.secondary.map((color, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </AgencyCard>

            {/* Typography */}
            <AgencyCard
              title="Typography"
              rationale={`${brandSystem.typography.primary.rationale} ${brandSystem.typography.secondary.rationale}`}
              approved={brandSystem.typography.approved}
              onApprove={approveTypography}
            >
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/60 mb-1">Primary</div>
                  <p className="text-2xl font-semibold" style={{ fontFamily: brandSystem.typography.primary.name }}>
                    {brandSystem.typography.primary.name}
                  </p>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Secondary</div>
                  <p className="text-xl" style={{ fontFamily: brandSystem.typography.secondary.name }}>
                    {brandSystem.typography.secondary.name}
                  </p>
                </div>
              </div>
            </AgencyCard>

            {/* Tone of Voice */}
            <AgencyCard
              title="Tone of Voice"
              rationale={brandSystem.toneOfVoice.rationale}
              approved={brandSystem.toneOfVoice.approved}
              onApprove={approveToneOfVoice}
            >
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/60 mb-2">Principles</div>
                  <ul className="list-disc list-inside space-y-1 text-white/80">
                    {brandSystem.toneOfVoice.principles.map((principle, i) => (
                      <li key={i}>{principle}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/60 mb-2">Do</div>
                    <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                      {brandSystem.toneOfVoice.do.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-2">Don't</div>
                    <ul className="list-disc list-inside space-y-1 text-white/80 text-sm">
                      {brandSystem.toneOfVoice.dont.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </AgencyCard>

            {/* Messaging Examples */}
            {brandSystem.messagingExamples.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Messaging Examples</h3>
                <div className="space-y-4">
                  {brandSystem.messagingExamples.map((example) => (
                    <div
                      key={example.id}
                      className="p-4 border border-white/20"
                    >
                      <div className="text-xs text-white/60 mb-1">{example.context}</div>
                      <p className="text-white/80 mb-2">{example.message}</p>
                      <div className="text-xs text-white/60">{example.rationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {productionComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-center"
              >
                <motion.button
                  onClick={approveProduction}
                  className="px-8 py-4 border-2 border-white hover:bg-white hover:text-black transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Approve Production →
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'delivering' && (
          <DeliverablesVault />
        )}
      </AnimatePresence>
    </div>
  )
}
