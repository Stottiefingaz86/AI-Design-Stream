/**
 * Sports Home seed — Popular (live mix), SGP packs, board section picks.
 */
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import {
  NFL_GAME_SECTIONS,
  nflBoardColumns,
  nflEventHref,
  nflEventLabel,
} from '@/lib/lumen/nfl-sport'
import { soccerEventHref, soccerEventLabel } from '@/lib/lumen/soccer-event'
import {
  SOCCER_GAME_SECTIONS,
  americanToProb,
  type SoccerEvent,
  type SoccerLeagueSection,
  type SoccerOdds,
} from '@/lib/lumen/soccer-sport'

const SGP_HAIRCUT = 0.82

function parseAmerican(odds: string): number {
  const n = Number.parseFloat(odds.replace(/^\+/, ''))
  return Number.isFinite(n) ? n : -110
}

function americanToDecimal(american: number): number {
  if (american > 0) return 1 + american / 100
  return 1 + 100 / Math.abs(american)
}

function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`
  return `${Math.round(-100 / (decimal - 1))}`
}

/** Same haircut as the betslip SGP unit. */
export function sgpPackOdds(legs: SoccerSlipPick[]): string {
  if (legs.length === 0) return ''
  if (legs.length === 1) return legs[0]!.odds
  const product = legs.reduce((acc, p) => acc * americanToDecimal(parseAmerican(p.odds)), 1)
  return decimalToAmerican(1 + (product - 1) * SGP_HAIRCUT)
}

export type PopularCard = {
  id: string
  sport: 'soccer' | 'nfl'
  leagueName: string
  leagueIcon: string
  home: string
  away: string
  homeAbbr: string
  awayAbbr: string
  score: [number, number]
  when: string
  href: string
  /** Moneyline implied % — soccer [home, draw, away]; NFL [away, home]. */
  mlPct: number[]
  awayFirst: boolean
}

function pctsFromOdds(cells: SoccerOdds[]): number[] {
  const raw = cells.map((c) => americanToProb(parseAmerican(c.odds)))
  const sum = raw.reduce((a, b) => a + b, 0) || 1
  return raw.map((p) => Math.round((p / sum) * 100))
}

function normalizePct(pct: number[]): number[] {
  if (pct.length === 0) return pct
  const next = [...pct]
  const drift = 100 - next.reduce((a, b) => a + b, 0)
  next[next.length - 1] = (next[next.length - 1] ?? 0) + drift
  return next
}

function soccerPopular(section: SoccerLeagueSection, event: SoccerEvent): PopularCard {
  const ml = (event.desktopPicks ?? event.picks).slice(0, 3)
  return {
    id: event.id,
    sport: 'soccer',
    leagueName: section.name,
    leagueIcon: section.icon,
    home: event.home,
    away: event.away,
    homeAbbr: event.homeAbbr,
    awayAbbr: event.awayAbbr,
    score: event.score ?? [0, 0],
    when: event.when,
    href: soccerEventHref(event.id),
    mlPct: normalizePct(pctsFromOdds(ml)),
    awayFirst: false,
  }
}

function nflPopular(section: SoccerLeagueSection, event: SoccerEvent): PopularCard {
  const cells = nflBoardColumns(event)[0]?.cells ?? []
  return {
    id: event.id,
    sport: 'nfl',
    leagueName: section.name,
    leagueIcon: section.icon,
    home: event.home,
    away: event.away,
    homeAbbr: event.homeAbbr,
    awayAbbr: event.awayAbbr,
    score: event.score ?? [0, 0],
    when: event.when,
    href: nflEventHref(event.id),
    mlPct: normalizePct(pctsFromOdds(cells)),
    awayFirst: true,
  }
}

/** Live-only mix for the Popular rail — soccer + NFL. */
export function sportsHomePopular(): PopularCard[] {
  const out: PopularCard[] = []
  for (const section of SOCCER_GAME_SECTIONS) {
    for (const event of section.events) {
      if (event.live) out.push(soccerPopular(section, event))
    }
  }
  for (const section of NFL_GAME_SECTIONS) {
    for (const event of section.events) {
      if (event.live) out.push(nflPopular(section, event))
    }
  }
  /* Demo richness — a couple of spotlight games read as live on home only. */
  if (out.length < 4) {
    const spot = [
      { sectionId: 'epl', eventId: 'mun-mci', when: "12'" },
      { sectionId: 'nfl', eventId: 'kc-buf', when: 'Q2 4:18' },
      { sectionId: 'championship', eventId: 'lei-nor', when: "67'" },
    ]
    for (const s of spot) {
      if (out.some((c) => c.id === s.eventId)) continue
      const soccer = SOCCER_GAME_SECTIONS.find((x) => x.id === s.sectionId)
      const nfl = NFL_GAME_SECTIONS.find((x) => x.id === s.sectionId)
      const section = soccer ?? nfl
      const event = section?.events.find((e) => e.id === s.eventId)
      if (!section || !event) continue
      const card =
        section === soccer
          ? soccerPopular(section, {
              ...event,
              live: true,
              when: s.when,
              score: event.score ?? [1, 0],
            })
          : nflPopular(section, {
              ...event,
              live: true,
              when: s.when,
              score: event.score ?? [14, 10],
            })
      out.push(card)
      if (out.length >= 5) break
    }
  }
  return out
}

export type SgpLeg = SoccerSlipPick & {
  /** Card copy — full selection, e.g. "Coventry City to win". */
  display: string
}

export type SgpPack = {
  id: string
  eventLabel: string
  eventHref: string
  sport: 'soccer' | 'nfl'
  /** Board order — soccer home first, NFL away first. */
  teams: [string, string]
  leagueName: string
  leagueIcon: string
  when: string
  live?: boolean
  legs: SgpLeg[]
  odds: string
}

type LegSeed = Omit<SgpLeg, 'eventLabel' | 'eventId' | 'eventHref' | 'sport' | 'live'>

function pack(
  id: string,
  section: SoccerLeagueSection,
  event: SoccerEvent,
  sport: 'soccer' | 'nfl',
  legs: LegSeed[],
): SgpPack {
  const eventLabel = sport === 'nfl' ? nflEventLabel(event) : soccerEventLabel(event)
  const eventHref = sport === 'nfl' ? nflEventHref(event.id) : soccerEventHref(event.id)
  const full: SgpLeg[] = legs.map((l) => ({
    ...l,
    eventLabel,
    eventId: event.id,
    eventHref,
    sport,
    live: !!event.live,
  }))
  return {
    id,
    eventLabel,
    eventHref,
    sport,
    teams: sport === 'nfl' ? [event.away, event.home] : [event.home, event.away],
    leagueName: section.name,
    leagueIcon: section.icon,
    when: event.when,
    live: !!event.live,
    legs: full,
    odds: sgpPackOdds(full),
  }
}

function find(
  sections: SoccerLeagueSection[],
  id: string,
): { section: SoccerLeagueSection; event: SoccerEvent } | null {
  for (const section of sections) {
    const event = section.events.find((x) => x.id === id)
    if (event) return { section, event }
  }
  return null
}

function totalDisplay(label: string, unit: 'goals' | 'points'): string {
  const m = label.match(/^([OU])\s*([\d.]+)/)
  if (!m) return label
  return `${m[1] === 'O' ? 'Over' : 'Under'} ${m[2]} ${unit}`
}

/** Pre-built same-game packs — Add puts every leg on the slip. */
export function sportsHomeSgpPacks(): SgpPack[] {
  const packs: SgpPack[] = []

  const cov = find(SOCCER_GAME_SECTIONS, 'cov-bri')
  if (cov) {
    const { section, event } = cov
    const picks = event.desktopPicks ?? event.picks
    const tot = event.totalLines?.[2]?.a
    packs.push(
      pack('sgp-cov-bri', section, event, 'soccer', [
        {
          id: picks[0]!.id,
          label: picks[0]!.label,
          odds: picks[0]!.odds,
          market: '3-Way Regulation',
          display: `${event.home} to win`,
        },
        {
          id: tot?.id ?? `${event.id}-tot-o`,
          label: tot?.label ?? 'O 3.5',
          odds: tot?.odds ?? '-115',
          market: 'Total',
          display: totalDisplay(tot?.label ?? 'O 3.5', 'goals'),
        },
        {
          id: `${event.id}-btts-y`,
          label: 'Yes',
          odds: '-105',
          market: 'Both Teams to Score',
          display: 'Both teams to score',
        },
      ]),
    )
  }

  const mun = find(SOCCER_GAME_SECTIONS, 'mun-mci')
  if (mun) {
    const { section, event } = mun
    const picks = event.desktopPicks ?? event.picks
    const tot = event.totalLines?.[1]?.a
    packs.push(
      pack('sgp-mun-mci', section, event, 'soccer', [
        {
          id: picks[2]!.id,
          label: picks[2]!.label,
          odds: picks[2]!.odds,
          market: '3-Way Regulation',
          display: `${event.away} to win`,
        },
        {
          id: tot?.id ?? `${event.id}-tot`,
          label: tot?.label ?? 'O 2.5',
          odds: tot?.odds ?? '-120',
          market: 'Total',
          display: totalDisplay(tot?.label ?? 'O 2.5', 'goals'),
        },
        {
          id: `${event.id}-btts-y`,
          label: 'Yes',
          odds: '-150',
          market: 'Both Teams to Score',
          display: 'Both teams to score',
        },
      ]),
    )
  }

  const sea = find(NFL_GAME_SECTIONS, 'sea-sf')
  if (sea) {
    const { section, event } = sea
    const [ml, sp, tot] = nflBoardColumns(event)
    if (ml && sp && tot) {
      packs.push(
        pack('sgp-sea-sf', section, event, 'nfl', [
          {
            id: ml.cells[0]!.id,
            label: event.awayAbbr,
            odds: ml.cells[0]!.odds,
            market: ml.slipMarket,
            display: `${event.away} to win`,
          },
          {
            id: sp.cells[0]!.id,
            label: sp.cells[0]!.slipLabel ?? sp.cells[0]!.label,
            odds: sp.cells[0]!.odds,
            market: sp.slipMarket,
            display: `${event.away} ${sp.cells[0]!.label}`,
          },
          {
            id: tot.cells[0]!.id,
            label: tot.cells[0]!.slipLabel ?? tot.cells[0]!.label,
            odds: tot.cells[0]!.odds,
            market: tot.slipMarket,
            display: totalDisplay(tot.cells[0]!.label, 'points'),
          },
        ]),
      )
    }
  }

  const kc = find(NFL_GAME_SECTIONS, 'kc-buf')
  if (kc) {
    const { section, event } = kc
    const [ml, , tot] = nflBoardColumns(event)
    if (ml && tot) {
      packs.push(
        pack('sgp-kc-buf', section, event, 'nfl', [
          {
            id: ml.cells[1]!.id,
            label: event.homeAbbr,
            odds: ml.cells[1]!.odds,
            market: ml.slipMarket,
            display: `${event.home} to win`,
          },
          {
            id: tot.cells[1]!.id,
            label: tot.cells[1]!.slipLabel ?? tot.cells[1]!.label,
            odds: tot.cells[1]!.odds,
            market: tot.slipMarket,
            display: totalDisplay(tot.cells[1]!.label, 'points'),
          },
        ]),
      )
    }
  }

  const dal = find(NFL_GAME_SECTIONS, 'dal-phi')
  if (dal) {
    const { section, event } = dal
    const [ml, sp] = nflBoardColumns(event)
    if (ml && sp) {
      packs.push(
        pack('sgp-dal-phi', section, event, 'nfl', [
          {
            id: ml.cells[1]!.id,
            label: event.homeAbbr,
            odds: ml.cells[1]!.odds,
            market: ml.slipMarket,
            display: `${event.home} to win`,
          },
          {
            id: sp.cells[1]!.id,
            label: sp.cells[1]!.slipLabel ?? sp.cells[1]!.label,
            odds: sp.cells[1]!.odds,
            market: sp.slipMarket,
            display: `${event.home} ${sp.cells[1]!.label}`,
          },
        ]),
      )
    }
  }

  return packs
}

export function sportsHomePremierLeague(): SoccerLeagueSection | null {
  return SOCCER_GAME_SECTIONS.find((s) => s.id === 'epl') ?? null
}

export function sportsHomeNflBoard(): SoccerLeagueSection | null {
  return NFL_GAME_SECTIONS.find((s) => s.id === 'nfl') ?? null
}

export type OddsBoost = {
  id: string
  sport: 'soccer' | 'nfl'
  leagueName: string
  leagueIcon: string
  when: string
  live: boolean
  teams: [string, string]
  eventHref: string
  title: string
  was: string
  boosted: string
  /** Straight-only on the slip — boosts never join an SGP or parlay. */
  pick: SoccerSlipPick
}

const BOOST_SEEDS: {
  sport: 'soccer' | 'nfl'
  eventId: string
  title: string
  was: string
  boosted: string
}[] = [
  {
    sport: 'soccer',
    eventId: 'mun-mci',
    title: 'Erling Haaland to score & Man City to win',
    was: '+180',
    boosted: '+225',
  },
  {
    sport: 'nfl',
    eventId: 'sea-sf',
    title: 'Kenneth Walker III 75+ rush yards & Seahawks to win',
    was: '+260',
    boosted: '+320',
  },
  {
    sport: 'soccer',
    eventId: 'cov-bri',
    title: 'Both teams to score & Over 3.5 goals',
    was: '+140',
    boosted: '+175',
  },
  {
    sport: 'nfl',
    eventId: 'kc-buf',
    title: 'Josh Allen 2+ TD passes & Bills to win',
    was: '+150',
    boosted: '+190',
  },
]

export function sportsHomeOddsBoosts(): OddsBoost[] {
  const out: OddsBoost[] = []
  for (const seed of BOOST_SEEDS) {
    const hit = find(seed.sport === 'nfl' ? NFL_GAME_SECTIONS : SOCCER_GAME_SECTIONS, seed.eventId)
    if (!hit) continue
    const { section, event } = hit
    const nfl = seed.sport === 'nfl'
    const eventLabel = nfl ? nflEventLabel(event) : soccerEventLabel(event)
    const eventHref = nfl ? nflEventHref(event.id) : soccerEventHref(event.id)
    const id = `boost-${event.id}`
    out.push({
      id,
      sport: seed.sport,
      leagueName: section.name,
      leagueIcon: section.icon,
      when: event.when,
      live: !!event.live,
      teams: nfl ? [event.away, event.home] : [event.home, event.away],
      eventHref,
      title: seed.title,
      was: seed.was,
      boosted: seed.boosted,
      pick: {
        id,
        label: seed.title,
        odds: seed.boosted,
        eventLabel,
        market: 'Odds Boost',
        eventHref,
        sport: seed.sport,
        live: !!event.live,
        outright: true,
      },
    })
  }
  return out
}

/** Light haircut — megas are 4+ legs for huge tickets. */
const MEGA_HAIRCUT = 0.92
const MEGA_MIN_LEGS = 4

/** Cross-game mega parlays — 4+ legs, big odds; distinct eventIds → slip Parlay. */
export type MegaParlay = {
  id: string
  sport: 'soccer' | 'nfl'
  title: string
  legs: SgpLeg[]
  odds: string
}

type MegaSeed = {
  id: string
  sport: 'soccer' | 'nfl'
  title: string
  legs: { eventId: string; pick: 'ml0' | 'ml1' | 'ml2' | 'totO' | 'totU'; display: string }[]
}

function megaLeg(
  sport: 'soccer' | 'nfl',
  eventId: string,
  pick: MegaSeed['legs'][number]['pick'],
  display: string,
): SgpLeg | null {
  const hit = find(sport === 'nfl' ? NFL_GAME_SECTIONS : SOCCER_GAME_SECTIONS, eventId)
  if (!hit) return null
  const { event } = hit
  const eventLabel = sport === 'nfl' ? nflEventLabel(event) : soccerEventLabel(event)
  const eventHref = sport === 'nfl' ? nflEventHref(event.id) : soccerEventHref(event.id)
  let cell: SoccerOdds | undefined
  let market = 'Moneyline'
  if (sport === 'nfl') {
    const [ml, , tot] = nflBoardColumns(event)
    if (pick === 'ml0') cell = ml?.cells[0]
    else if (pick === 'ml1') cell = ml?.cells[1]
    else if (pick === 'totO') {
      cell = tot?.cells[0]
      market = tot?.slipMarket ?? 'Total'
    } else if (pick === 'totU') {
      cell = tot?.cells[1]
      market = tot?.slipMarket ?? 'Total'
    }
  } else {
    const picks = event.desktopPicks ?? event.picks
    if (pick === 'ml0') cell = picks[0]
    else if (pick === 'ml1') cell = picks[1]
    else if (pick === 'ml2') cell = picks[2]
    else if (pick === 'totO') {
      cell = event.totalLines?.[1]?.a
      market = 'Total'
    } else if (pick === 'totU') {
      cell = event.totalLines?.[1]?.b
      market = 'Total'
    }
  }
  if (!cell) return null
  return {
    id: `${event.id}-mega-${cell.id}`,
    label: cell.slipLabel ?? cell.label,
    odds: cell.odds,
    market,
    display,
    eventLabel,
    eventId: event.id,
    eventHref,
    sport,
    live: !!event.live,
  }
}

/** 4+ legs across games — underdogs / overs for ticket-size odds. */
const MEGA_SEEDS: MegaSeed[] = [
  {
    id: 'mega-nfl-1',
    sport: 'nfl',
    title: 'Sunday longshot mega',
    legs: [
      { eventId: 'sea-sf', pick: 'ml1', display: '49ers to win' },
      { eventId: 'kc-buf', pick: 'ml0', display: 'Chiefs to win' },
      { eventId: 'dal-phi', pick: 'ml0', display: 'Cowboys to win' },
      { eventId: 'mia-nyj', pick: 'totO', display: 'MIA @ NYJ Over' },
      { eventId: 'lar-ari', pick: 'ml1', display: 'Cardinals to win' },
    ],
  },
  {
    id: 'mega-nfl-2',
    sport: 'nfl',
    title: 'NFC / AFC bomb',
    legs: [
      { eventId: 'chi-min', pick: 'ml0', display: 'Bears to win' },
      { eventId: 'det-gb', pick: 'totO', display: 'DET @ GB Over' },
      { eventId: 'bal-cin', pick: 'ml1', display: 'Bengals to win' },
      { eventId: 'sea-sf', pick: 'totO', display: 'SEA @ SF Over' },
    ],
  },
  {
    id: 'mega-soccer-1',
    sport: 'soccer',
    title: 'EPL upset mega',
    legs: [
      { eventId: 'mun-mci', pick: 'ml0', display: 'Man United to win' },
      { eventId: 'cov-bri', pick: 'ml0', display: 'Coventry to win' },
      { eventId: 'lee-new', pick: 'ml0', display: 'Leeds to win' },
      { eventId: 'bre-che', pick: 'totO', display: 'Brentford vs Chelsea Over' },
      { eventId: 'tot-avl', pick: 'ml2', display: 'Aston Villa to win' },
    ],
  },
  {
    id: 'mega-soccer-2',
    sport: 'soccer',
    title: 'Europe goals mega',
    legs: [
      { eventId: 'rma-bar', pick: 'totO', display: 'El Clasico Over' },
      { eventId: 'atm-sev', pick: 'ml0', display: 'Atlético to win' },
      { eventId: 'vil-bet', pick: 'ml2', display: 'Betis to win' },
      { eventId: 'lei-nor', pick: 'totO', display: 'Leicester vs Norwich Over' },
    ],
  },
]

export function sportsHomeMegaParlays(): MegaParlay[] {
  const out: MegaParlay[] = []
  for (const seed of MEGA_SEEDS) {
    const legs = seed.legs
      .map((l) => megaLeg(seed.sport, l.eventId, l.pick, l.display))
      .filter((l): l is SgpLeg => !!l)
    if (legs.length < MEGA_MIN_LEGS) continue
    const product = legs.reduce((acc, p) => acc * americanToDecimal(parseAmerican(p.odds)), 1)
    out.push({
      id: seed.id,
      sport: seed.sport,
      title: seed.title,
      legs,
      odds: decimalToAmerican(1 + (product - 1) * MEGA_HAIRCUT),
    })
  }
  return out
}

export function sportSgpPacks(sport: 'soccer' | 'nfl'): SgpPack[] {
  return sportsHomeSgpPacks().filter((p) => p.sport === sport)
}

export function sportOddsBoosts(sport: 'soccer' | 'nfl'): OddsBoost[] {
  return sportsHomeOddsBoosts().filter((b) => b.sport === sport)
}

export function sportMegaParlays(sport: 'soccer' | 'nfl'): MegaParlay[] {
  return sportsHomeMegaParlays().filter((m) => m.sport === sport)
}
