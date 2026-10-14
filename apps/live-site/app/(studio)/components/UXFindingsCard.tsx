'use client'

import { motion } from 'framer-motion'

interface Finding {
  issue: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  description: string
  recommendation?: string
  affectedArea?: string
}

interface UXFindingsCardProps {
  findings: Finding[]
  title?: string
  source?: string
  sourceUrl?: string
}

export function UXFindingsCard({ findings, title, source, sourceUrl }: UXFindingsCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/40 text-red-300'
      case 'high':
        return 'bg-orange-500/20 border-orange-500/40 text-orange-300'
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
      case 'low':
        return 'bg-blue-500/20 border-blue-500/40 text-blue-300'
      default:
        return 'bg-white/10 border-white/20 text-white/60'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🔴'
      case 'high':
        return '🟠'
      case 'medium':
        return '🟡'
      case 'low':
        return '🔵'
      default:
        return '⚪'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4 space-y-3"
    >
      {(title || source) && (
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
          <div className="flex-1">
            {title && <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>}
            {source && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">📊 Source:</span>
                <span className="text-white/70 text-xs font-medium">{source}</span>
                {sourceUrl && (
                  <a 
                    href={sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/50 text-xs hover:text-white/70 underline"
                  >
                    View source →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {findings.map((finding, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{getSeverityIcon(finding.severity)}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
                  {finding.severity.toUpperCase()}
                </span>
                {finding.affectedArea && (
                  <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/70 border border-white/10">
                    {finding.affectedArea}
                  </span>
                )}
              </div>
            </div>
            
            <h5 className="text-white font-medium text-sm mb-1.5">{finding.issue}</h5>
            <p className="text-white/70 text-xs leading-relaxed mb-2">{finding.description}</p>
            
            {finding.recommendation && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-white/50 text-xs font-medium mb-1">💡 Recommendation:</p>
                <p className="text-white/60 text-xs leading-relaxed">{finding.recommendation}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
