'use client'

import { cn } from '@/lib/utils'

type BenefitRow = {
  benefit: string
  bronze: string
  silver: string
  gold: string
}

/** Per-tier VIP benefits — Benefits tab in the hub (design-lane prototype). */
const BENEFIT_ROWS: BenefitRow[] = [
  {
    benefit: 'Rakeback',
    bronze: '5%',
    silver: '10%',
    gold: '15%',
  },
  {
    benefit: 'Weekly Boost',
    bronze: '—',
    silver: 'Up to $50',
    gold: 'Up to $150',
  },
  {
    benefit: 'Monthly Boost',
    bronze: '—',
    silver: 'Up to $100',
    gold: 'Up to $300',
  },
  {
    benefit: 'Daily Spin',
    bronze: 'Yes',
    silver: 'Yes',
    gold: 'Yes + better odds',
  },
  {
    benefit: 'Level-up bonus',
    bronze: '—',
    silver: '$25',
    gold: '$100',
  },
  {
    benefit: 'Birthday reward',
    bronze: 'Cash',
    silver: 'Cash + spins',
    gold: 'Cash + spins',
  },
  {
    benefit: 'Priority support',
    bronze: '—',
    silver: 'Chat',
    gold: 'Dedicated',
  },
  {
    benefit: 'Reload offers',
    bronze: 'Standard',
    silver: 'Enhanced',
    gold: 'VIP-only',
  },
]

/**
 * VIP Hub → Benefits: table of what you get per tier.
 * Lumen tokens only — card surface, border, muted labels.
 */
export function VipBenefitsPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Benefits by level</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          What unlocks as you move Bronze → Silver → Gold.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted-3/40">
              <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                Benefit
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                Bronze
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                Silver
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                Gold
              </th>
            </tr>
          </thead>
          <tbody>
            {BENEFIT_ROWS.map((row) => (
              <tr
                key={row.benefit}
                className="border-b border-border last:border-0 [@media(hover:hover)_and_(pointer:fine)]:hover:!bg-surface-muted-3"
              >
                <td className="px-4 py-3 font-medium text-foreground">{row.benefit}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.bronze}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.silver}</td>
                <td className="px-3 py-3 text-foreground">{row.gold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
