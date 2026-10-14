/**
 * Jurnii Report Comparison Utility
 * 
 * Compares two Jurnii reports to identify differences, new findings, and changes
 */

import { UXReport } from '@/lib/agent/knowledgeBase'

export interface ReportComparison {
  newFindings: UXReport['findings']
  removedFindings: UXReport['findings']
  updatedFindings: Array<{
    old: UXReport['findings'][0]
    new: UXReport['findings'][0]
    changes: string[]
  }>
  newCompetitorScores: NonNullable<UXReport['competitorScores']>
  updatedCompetitorScores: Array<{
    old: NonNullable<UXReport['competitorScores']>[0]
    new: NonNullable<UXReport['competitorScores']>[0]
    changes: string[]
  }>
  executiveSummaryChanges?: {
    old?: string
    new?: string
    summary: string
  }
  sectionChanges: {
    perception?: { old?: any; new?: any; changed: boolean }
    journey?: { old?: any; new?: any; changed: boolean }
    trends?: { old?: any; new?: any; changed: boolean }
    performance?: { old?: any; new?: any; changed: boolean }
    checking?: { old?: any; new?: any; changed: boolean }
  }
  summary: string
}

/**
 * Compare two Jurnii reports and identify differences
 */
export function compareJurniiReports(
  oldReport: UXReport,
  newReport: UXReport
): ReportComparison {
  const comparison: ReportComparison = {
    newFindings: [],
    removedFindings: [],
    updatedFindings: [],
    newCompetitorScores: [],
    updatedCompetitorScores: [],
    sectionChanges: {},
    summary: '',
  }

  // Compare findings
  const oldFindingsMap = new Map(
    oldReport.findings.map(f => [f.issue.toLowerCase().trim(), f])
  )
  const newFindingsMap = new Map(
    newReport.findings.map(f => [f.issue.toLowerCase().trim(), f])
  )

  // Find new findings
  for (const [key, finding] of newFindingsMap) {
    if (!oldFindingsMap.has(key)) {
      comparison.newFindings.push(finding)
    } else {
      // Check if finding was updated
      const oldFinding = oldFindingsMap.get(key)!
      const changes: string[] = []
      
      if (oldFinding.severity !== finding.severity) {
        changes.push(`Severity changed: ${oldFinding.severity} → ${finding.severity}`)
      }
      if (oldFinding.description !== finding.description) {
        changes.push('Description updated')
      }
      if (oldFinding.recommendation !== finding.recommendation) {
        changes.push('Recommendation updated')
      }
      if (oldFinding.affectedArea !== finding.affectedArea) {
        changes.push(`Affected area changed: ${oldFinding.affectedArea} → ${finding.affectedArea}`)
      }
      
      if (changes.length > 0) {
        comparison.updatedFindings.push({
          old: oldFinding,
          new: finding,
          changes,
        })
      }
    }
  }

  // Find removed findings
  for (const [key, finding] of oldFindingsMap) {
    if (!newFindingsMap.has(key)) {
      comparison.removedFindings.push(finding)
    }
  }

  // Compare competitor scores
  if (oldReport.competitorScores && newReport.competitorScores) {
    const oldScoresMap = new Map(
      oldReport.competitorScores.map(s => [
        `${s.competitor}-${s.category}`.toLowerCase(),
        s,
      ])
    )
    const newScoresMap = new Map(
      newReport.competitorScores.map(s => [
        `${s.competitor}-${s.category}`.toLowerCase(),
        s,
      ])
    )

    // Find new competitor scores
    for (const [key, score] of newScoresMap) {
      if (!oldScoresMap.has(key)) {
        comparison.newCompetitorScores.push(score)
      } else {
        // Check if score was updated
        const oldScore = oldScoresMap.get(key)!
        const changes: string[] = []
        
        if (oldScore.score !== score.score) {
          changes.push(`Score changed: ${oldScore.score} → ${score.score}`)
        }
        if (oldScore.ourScore !== score.ourScore) {
          changes.push(`Our score changed: ${oldScore.ourScore} → ${score.ourScore}`)
        }
        if (oldScore.comparison !== score.comparison) {
          changes.push('Comparison text updated')
        }
        
        if (changes.length > 0) {
          comparison.updatedCompetitorScores.push({
            old: oldScore,
            new: score,
            changes,
          })
        }
      }
    }
  } else if (newReport.competitorScores) {
    // All new scores if old report didn't have them
    comparison.newCompetitorScores = newReport.competitorScores
  }

  // Compare executive summary
  if (oldReport.executiveSummary !== newReport.executiveSummary) {
    comparison.executiveSummaryChanges = {
      old: oldReport.executiveSummary,
      new: newReport.executiveSummary,
      summary: 'Executive summary has been updated',
    }
  }

  // Compare sections
  const sections: Array<'perception' | 'journey' | 'trends' | 'performance' | 'checking'> = [
    'perception',
    'journey',
    'trends',
    'performance',
    'checking',
  ]

  for (const section of sections) {
    const oldSection = oldReport[section]
    const newSection = newReport[section]
    
    if (JSON.stringify(oldSection) !== JSON.stringify(newSection)) {
      comparison.sectionChanges[section] = {
        old: oldSection,
        new: newSection,
        changed: true,
      }
    }
  }

  // Generate summary
  const summaryParts: string[] = []
  
  if (comparison.newFindings.length > 0) {
    summaryParts.push(`${comparison.newFindings.length} new finding(s)`)
  }
  if (comparison.removedFindings.length > 0) {
    summaryParts.push(`${comparison.removedFindings.length} finding(s) removed`)
  }
  if (comparison.updatedFindings.length > 0) {
    summaryParts.push(`${comparison.updatedFindings.length} finding(s) updated`)
  }
  if (comparison.newCompetitorScores.length > 0) {
    summaryParts.push(`${comparison.newCompetitorScores.length} new competitor score(s)`)
  }
  if (comparison.updatedCompetitorScores.length > 0) {
    summaryParts.push(`${comparison.updatedCompetitorScores.length} competitor score(s) updated`)
  }
  if (comparison.executiveSummaryChanges) {
    summaryParts.push('Executive summary updated')
  }
  
  const changedSections = Object.keys(comparison.sectionChanges).filter(
    key => comparison.sectionChanges[key as keyof typeof comparison.sectionChanges]?.changed
  )
  if (changedSections.length > 0) {
    summaryParts.push(`${changedSections.length} section(s) updated: ${changedSections.join(', ')}`)
  }

  comparison.summary = summaryParts.length > 0
    ? `Report comparison: ${summaryParts.join(', ')}`
    : 'No significant changes detected'

  return comparison
}

/**
 * Format comparison as a readable string for display
 */
export function formatComparison(comparison: ReportComparison): string {
  const parts: string[] = []
  
  parts.push(`## Report Comparison Summary\n${comparison.summary}\n`)

  if (comparison.newFindings.length > 0) {
    parts.push(`### 🆕 New Findings (${comparison.newFindings.length})`)
    comparison.newFindings.forEach((finding, idx) => {
      parts.push(`${idx + 1}. **${finding.issue}** (${finding.severity})`)
      parts.push(`   - ${finding.description}`)
      if (finding.recommendation) {
        parts.push(`   - Recommendation: ${finding.recommendation}`)
      }
      if (finding.affectedArea) {
        parts.push(`   - Affected Area: ${finding.affectedArea}`)
      }
      parts.push('')
    })
  }

  if (comparison.removedFindings.length > 0) {
    parts.push(`### ❌ Removed Findings (${comparison.removedFindings.length})`)
    comparison.removedFindings.forEach((finding, idx) => {
      parts.push(`${idx + 1}. **${finding.issue}** (${finding.severity})`)
      parts.push('')
    })
  }

  if (comparison.updatedFindings.length > 0) {
    parts.push(`### 🔄 Updated Findings (${comparison.updatedFindings.length})`)
    comparison.updatedFindings.forEach((update, idx) => {
      parts.push(`${idx + 1}. **${update.new.issue}**`)
      update.changes.forEach(change => {
        parts.push(`   - ${change}`)
      })
      parts.push('')
    })
  }

  if (comparison.newCompetitorScores.length > 0) {
    parts.push(`### 🆕 New Competitor Scores (${comparison.newCompetitorScores.length})`)
    comparison.newCompetitorScores.forEach((score, idx) => {
      parts.push(`${idx + 1}. **${score.competitor}** - ${score.category}: ${score.score}/10`)
      if (score.ourScore) {
        parts.push(`   - Our score: ${score.ourScore}/10`)
      }
      if (score.comparison) {
        parts.push(`   - ${score.comparison}`)
      }
      parts.push('')
    })
  }

  if (comparison.updatedCompetitorScores.length > 0) {
    parts.push(`### 🔄 Updated Competitor Scores (${comparison.updatedCompetitorScores.length})`)
    comparison.updatedCompetitorScores.forEach((update, idx) => {
      parts.push(`${idx + 1}. **${update.new.competitor}** - ${update.new.category}`)
      update.changes.forEach(change => {
        parts.push(`   - ${change}`)
      })
      parts.push('')
    })
  }

  if (comparison.executiveSummaryChanges) {
    parts.push('### 📝 Executive Summary Updated')
    parts.push('The executive summary has been revised with new insights.')
    parts.push('')
  }

  const changedSections = Object.keys(comparison.sectionChanges).filter(
    key => comparison.sectionChanges[key as keyof typeof comparison.sectionChanges]?.changed
  )
  if (changedSections.length > 0) {
    parts.push(`### 📊 Updated Sections (${changedSections.length})`)
    changedSections.forEach(section => {
      parts.push(`- **${section.charAt(0).toUpperCase() + section.slice(1)}** section has been updated`)
    })
    parts.push('')
  }

  return parts.join('\n')
}
