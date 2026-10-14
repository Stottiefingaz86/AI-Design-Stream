/**
 * Migration Script: Move In-Memory Knowledge Base to Supabase
 * 
 * This script migrates all existing knowledge from in-memory storage to Supabase:
 * - Design tokens (colors, typography, spacing, etc.)
 * - Figma files list
 * - Logos
 * - Stakeholders
 * - Processes
 * - UX Reports
 * 
 * Run: npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { knowledgeBase } from '../lib/agent/knowledgeBase'
import { designSystem, colorTokenMap } from '../lib/agent/designSystem'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateDesignTokens() {
  console.log('📦 Migrating design tokens...')
  
  const tokens: any[] = []
  
  // Extract color tokens
  Object.entries(colorTokenMap).forEach(([tokenName, tokenData]) => {
    const tokenInfo = typeof tokenData === 'string' 
      ? { hex: tokenData, description: undefined, figmaLink: undefined }
      : tokenData
    
    tokens.push({
      id: `token-${tokenName.replace(/\//g, '-')}`,
      token_type: 'color',
      token_name: tokenName,
      token_value: typeof tokenInfo.hex === 'string' ? tokenInfo.hex : (typeof tokenData === 'string' ? tokenData : JSON.stringify(tokenData)),
      description: tokenInfo.description || undefined,
      figma_link: tokenInfo.figmaLink || 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh/%F0%9F%94%98.-Agnostic-Design-System-%7C-MUI-v5.15.0---v5.14.12',
      brand: extractBrandFromToken(tokenName),
    })
  })
  
  // Extract typography tokens from design system
  if (designSystem.typography) {
    Object.entries(designSystem.typography).forEach(([tokenName, tokenData]: [string, any]) => {
      tokens.push({
        id: `token-typography-${tokenName.replace(/\//g, '-').replace(/\s+/g, '-')}`,
        token_type: 'typography',
        token_name: tokenName,
        token_value: typeof tokenData === 'string' ? tokenData : JSON.stringify(tokenData),
        description: typeof tokenData === 'object' ? tokenData.description : undefined,
        figma_link: 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh/%F0%9F%94%98.-Agnostic-Design-System-%7C-MUI-v5.15.0---v5.14.12',
      })
    })
  }
  
  // Extract spacing tokens
  if (designSystem.spacing) {
    Object.entries(designSystem.spacing).forEach(([tokenName, tokenValue]: [string, any]) => {
      tokens.push({
        id: `token-spacing-${tokenName.replace(/\//g, '-').replace(/\s+/g, '-')}`,
        token_type: 'spacing',
        token_name: tokenName,
        token_value: String(tokenValue),
        figma_link: 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh/%F0%9F%94%98.-Agnostic-Design-System-%7C-MUI-v5.15.0---v5.14.12',
      })
    })
  }
  
  // Extract shadow tokens
  if (designSystem.shadows) {
    Object.entries(designSystem.shadows).forEach(([tokenName, tokenValue]: [string, any]) => {
      tokens.push({
        id: `token-shadow-${tokenName.replace(/\//g, '-').replace(/\s+/g, '-')}`,
        token_type: 'shadow',
        token_name: tokenName,
        token_value: String(tokenValue),
        figma_link: 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh/%F0%9F%94%98.-Agnostic-Design-System-%7C-MUI-v5.15.0---v5.14.12',
      })
    })
  }
  
  // Extract border radius tokens
  if (designSystem.borderRadius) {
    Object.entries(designSystem.borderRadius).forEach(([tokenName, tokenValue]: [string, any]) => {
      tokens.push({
        id: `token-border-radius-${tokenName.replace(/\//g, '-').replace(/\s+/g, '-')}`,
        token_type: 'border-radius',
        token_name: tokenName,
        token_value: String(tokenValue),
        figma_link: 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh/%F0%9F%94%98.-Agnostic-Design-System-%7C-MUI-v5.15.0---v5.14.12',
      })
    })
  }
  
  // Insert tokens in batches (using upsert to avoid duplicates)
  const batchSize = 50
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize)
    for (const token of batch) {
      const { error } = await supabase
        .from('design_tokens')
        .upsert(token, { onConflict: 'token_name' })
      
      if (error) {
        console.error(`❌ Error migrating token ${token.token_name}:`, error.message)
      }
    }
    if (i % 100 === 0) {
      console.log(`  Progress: ${i}/${tokens.length} tokens...`)
    }
  }
  
  console.log(`✅ Migrated ${tokens.length} design tokens`)
}

async function migrateStakeholders() {
  console.log('👥 Migrating stakeholders...')
  
  const { stakeholders } = knowledgeBase
  
  for (const stakeholder of stakeholders) {
    const { error } = await supabase
      .from('stakeholders')
      .upsert({
        id: stakeholder.name.toLowerCase().replace(/\s+/g, '-'),
        name: stakeholder.name,
        role: stakeholder.role,
        responsibilities: stakeholder.responsibilities || [],
        contact: stakeholder.contact,
        areas: stakeholder.areas || [],
      }, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error migrating stakeholder ${stakeholder.name}:`, error.message)
    }
  }
  
  console.log(`✅ Migrated ${stakeholders.length} stakeholders`)
}

async function migrateProcesses() {
  console.log('🔄 Migrating processes...')
  
  const { processes } = knowledgeBase
  
  for (const process of processes) {
    const { error } = await supabase
      .from('processes')
      .upsert({
        id: process.name.toLowerCase().replace(/\s+/g, '-'),
        name: process.name,
        description: process.description,
        steps: process.steps || [],
        stakeholders: process.stakeholders || [],
        areas: process.areas || [],
        tools: process.tools || [],
      }, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error migrating process ${process.name}:`, error.message)
    }
  }
  
  console.log(`✅ Migrated ${processes.length} processes`)
}

async function migrateUXReports() {
  console.log('📊 Migrating UX reports...')
  
  const { uxReports } = knowledgeBase
  
  for (const report of uxReports) {
    const { error } = await supabase
      .from('ux_reports')
      .upsert({
        id: report.id,
        source: report.source,
        source_url: report.sourceUrl,
        title: report.title,
        date: report.date,
        summary: report.summary,
        priority: report.priority,
        overall_rating: report.overallRating,
        total_reviews: report.totalReviews,
        themes: report.themes || [],
        findings: report.findings || [],
      }, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error migrating report ${report.id}:`, error.message)
    }
  }
  
  console.log(`✅ Migrated ${uxReports.length} UX reports`)
}

async function migrateFigmaFiles() {
  console.log('🎨 Migrating Figma files list...')
  
  const { figmaFiles } = knowledgeBase
  
  // Store Figma files as knowledge notes for now
  // (We can create a separate table later if needed)
  for (const file of figmaFiles) {
    const content = JSON.stringify({
      name: file.name,
      url: file.url,
      description: file.description,
      contains: file.contains || [],
      lastUpdated: file.lastUpdated,
    }, null, 2)
    
    const { error } = await supabase
      .from('knowledge_notes')
      .upsert({
        id: `figma-file-${file.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: `Figma File: ${file.name}`,
        content: content,
        category: 'design-system',
        tags: ['figma', 'design-system', ...(file.contains || []).map(c => c.toLowerCase().replace(/\s+/g, '-'))],
      }, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error migrating Figma file ${file.name}:`, error.message)
    }
  }
  
  console.log(`✅ Migrated ${figmaFiles.length} Figma files`)
}

async function migrateLogos() {
  console.log('🖼️ Migrating logos...')
  
  const { logos } = knowledgeBase
  
  // Store logos as knowledge notes
  for (const logo of logos) {
    const content = JSON.stringify(logo, null, 2)
    
    const { error } = await supabase
      .from('knowledge_notes')
      .upsert({
        id: `logo-${logo.brand.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Logo: ${logo.brand}`,
        content: content,
        category: 'design-system',
        tags: ['logo', 'brand', logo.brand.toLowerCase().replace(/\s+/g, '-')],
      }, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error migrating logo ${logo.brand}:`, error.message)
    }
  }
  
  console.log(`✅ Migrated ${logos.length} logos`)
}

async function migrateBrandGuidelines() {
  console.log('📋 Migrating brand guidelines...')
  
  const { brandGuidelines } = knowledgeBase
  
  const content = JSON.stringify(brandGuidelines, null, 2)
  
  const { error } = await supabase
    .from('knowledge_notes')
    .upsert({
      id: 'brand-guidelines',
      title: 'Brand Guidelines',
      content: content,
      category: 'brand-guidelines',
      tags: ['brand-guidelines', 'tone-of-voice', 'communication', 'design-principles'],
    }, { onConflict: 'id' })
  
  if (error) {
    console.error(`❌ Error migrating brand guidelines:`, error.message)
  } else {
    console.log('✅ Migrated brand guidelines')
  }
}

async function migrateWebsites() {
  console.log('🌐 Migrating websites...')
  
  const { websites } = knowledgeBase
  
  // Store websites as knowledge notes
  for (const website of websites) {
    const content = JSON.stringify(website, null, 2)
    
    const { error } = await supabase
      .from('knowledge_notes')
      .upsert({
        id: `website-${website.name.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Website: ${website.name}`,
        content: content,
        category: 'websites',
        tags: ['website', website.name.toLowerCase().replace(/\s+/g, '-'), website.type?.toLowerCase() || 'production'],
      }, { onConflict: 'id' })
    
    if (error) {
      console.error(`❌ Error migrating website ${website.name}:`, error.message)
    }
  }
  
  console.log(`✅ Migrated ${websites.length} websites`)
}

function extractBrandFromToken(tokenName: string): string | undefined {
  const brands = ['BetOnline', 'WildCasino', 'TigerGaming', 'LowVig', 'SportsBetting', 'HighRoller', 'GamingCity', 'QueenBee', 'SuperSlots']
  const lowerName = tokenName.toLowerCase()
  
  for (const brand of brands) {
    if (lowerName.includes(brand.toLowerCase()) || lowerName.includes(brand.toLowerCase().replace(/\s+/g, ''))) {
      return brand
    }
  }
  
  return undefined
}

async function main() {
  console.log('🚀 Starting migration to Supabase...\n')
  
  try {
    await migrateDesignTokens()
    await migrateStakeholders()
    await migrateProcesses()
    await migrateUXReports()
    await migrateFigmaFiles()
    await migrateLogos()
    await migrateBrandGuidelines()
    await migrateWebsites()
    
    console.log('\n✅ Migration complete!')
    console.log('\n📋 Summary:')
    console.log(`  - Design tokens: Migrated from colorTokenMap and designSystem`)
    console.log(`  - Stakeholders: ${knowledgeBase.stakeholders.length}`)
    console.log(`  - Processes: ${knowledgeBase.processes.length}`)
    console.log(`  - UX Reports: ${knowledgeBase.uxReports.length}`)
    console.log(`  - Figma Files: ${knowledgeBase.figmaFiles.length}`)
    console.log(`  - Logos: ${knowledgeBase.logos.length}`)
    console.log(`  - Brand Guidelines: 1`)
    console.log(`  - Websites: ${knowledgeBase.websites.length}`)
    console.log('\n✨ All knowledge is now in Supabase!')
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main()
