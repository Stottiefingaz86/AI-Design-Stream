/**
 * V5 · Combos — Politics & Entertainment markets. The book is sports-first; these sit in one
 * home section, the Browse markets filter and the sport-page rail. No real people's names:
 * outcomes are parties, decisions, thresholds and invented titles.
 */
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { priceToAmerican } from '@/lib/lumen/sports-markets'
import type { KCard, KRow } from '@/lib/lumen/v5-markets'

export type TopicCategory = 'politics' | 'entertainment'

const ICON: Record<TopicCategory, string> = {
  politics: '/shell/figma/markets/politics.svg',
  entertainment: '/shell/figma/markets/entertainment.svg',
}

const LABEL: Record<TopicCategory, string> = { politics: 'Politics', entertainment: 'Entertainment' }

type Spec = {
  key: string
  category: TopicCategory
  title: string
  closes: string
  volume: number
  /** Binary → one Yes / No row. Multi → one Yes row per outcome. */
  rows: { label: string; chance: number; change: number }[]
  binary?: boolean
  glyph: string
}

const SPECS: Spec[] = [
  {
    key: 'fed-dec',
    glyph: 'bank',
    category: 'politics',
    title: 'Fed decision in December?',
    closes: 'Dec 16',
    volume: 28_387_717,
    rows: [
      { label: 'Cut 25bps', chance: 58, change: 3.1 },
      { label: 'Hold', chance: 39, change: -2.4 },
      { label: 'Cut 50bps', chance: 3, change: -0.7 },
    ],
  },
  {
    key: 'house-28',
    glyph: 'monument',
    category: 'politics',
    title: 'Which party wins the House in 2028?',
    closes: 'Nov 2028',
    volume: 16_442_633,
    rows: [
      { label: 'Democratic Party', chance: 56, change: 1.2 },
      { label: 'Republican Party', chance: 44, change: -1.2 },
    ],
  },
  {
    key: 'shutdown',
    glyph: 'lock',
    category: 'politics',
    title: 'Government shutdown before Feb 1?',
    closes: 'Jan 31',
    volume: 5_081_278,
    binary: true,
    rows: [{ label: 'Shutdown before Feb 1', chance: 27, change: 4.6 }],
  },
  {
    key: 'recession-27',
    glyph: 'chart',
    category: 'politics',
    title: 'US recession declared in 2027?',
    closes: 'Dec 31, 2027',
    volume: 3_402_115,
    binary: true,
    rows: [{ label: 'Recession in 2027', chance: 31, change: -1.8 }],
  },
  {
    key: 'best-picture',
    glyph: 'movie',
    category: 'entertainment',
    title: 'Best Picture winner 2027?',
    closes: 'Mar 2027',
    volume: 6_303_081,
    rows: [
      { label: 'The Long Tide', chance: 31, change: 2.2 },
      { label: 'Paper Kings', chance: 24, change: -0.9 },
      { label: 'Northern Lights', chance: 18, change: 0.4 },
      { label: 'Any other film', chance: 27, change: -1.7 },
    ],
  },
  {
    key: 'xmas-no1',
    glyph: 'music',
    category: 'entertainment',
    title: 'Christmas No.1 is a festive song?',
    closes: 'Dec 26',
    volume: 1_204_910,
    binary: true,
    rows: [{ label: 'Festive song at No.1', chance: 64, change: 5.3 }],
  },
  {
    key: 'box-office-dec',
    glyph: 'ticket',
    category: 'entertainment',
    title: 'Biggest December opening above $150M?',
    closes: 'Dec 21',
    volume: 2_118_402,
    binary: true,
    rows: [{ label: 'Opening above $150M', chance: 44, change: -3.2 }],
  },
  {
    key: 'top-series',
    glyph: 'tv',
    category: 'entertainment',
    title: 'Most-streamed series this week?',
    closes: 'Sun',
    volume: 853_826,
    rows: [
      { label: 'Harbor Lights S2', chance: 38, change: 6.1 },
      { label: 'The Quiet Year', chance: 27, change: -2.0 },
      { label: 'Ninth Circle', chance: 19, change: -1.4 },
      { label: 'Any other series', chance: 16, change: -2.7 },
    ],
  },
]

function pick(spec: Spec, id: string, label: string, chance: number): SoccerSlipPick {
  return {
    id,
    label,
    odds: priceToAmerican(chance),
    eventLabel: spec.title,
    market: spec.title,
    eventId: `v5-topic-${spec.key}`,
  }
}

function toCard(spec: Spec, i: number): KCard & { category: TopicCategory } {
  const rows: KRow[] = spec.rows.map((r, k) => {
    const base = `v5-topic-${spec.key}-${k}`
    const yes = pick(spec, `${base}-yes`, spec.binary ? `Yes · ${r.label}` : r.label, r.chance)
    return {
      id: base,
      label: r.label,
      badge: spec.binary ? undefined : r.label.slice(0, 1).toUpperCase(),
      chance: r.chance,
      change: r.change,
      yes,
      no: spec.binary ? pick(spec, `${base}-no`, `No · ${r.label}`, 100 - r.chance) : undefined,
    }
  })
  return {
    id: `v5-topic-${spec.key}`,
    title: spec.title,
    sub: `${LABEL[spec.category]} · Closes ${spec.closes}`,
    icon: ICON[spec.category],
    glyph: spec.glyph,
    sport: 'topic',
    league: LABEL[spec.category],
    category: spec.category,
    live: false,
    volume: spec.volume,
    startsAt: 9e15 + i,
    swing: Math.max(...spec.rows.map((r) => Math.abs(r.change))),
    balance: Math.abs((spec.rows[0]?.chance ?? 50) - 50),
    rows,
  }
}

let cache: (KCard & { category: TopicCategory })[] | null = null

export function topicCards(category?: TopicCategory): (KCard & { category: TopicCategory })[] {
  cache ??= SPECS.map(toCard)
  return category ? cache.filter((c) => c.category === category) : cache
}

/** Politics and Entertainment taking turns — for a mixed section. */
export function topicMix(): KCard[] {
  const pol = topicCards('politics')
  const ent = topicCards('entertainment')
  return pol.flatMap((p, i) => [p, ...(ent[i] ? [ent[i]!] : [])])
}
