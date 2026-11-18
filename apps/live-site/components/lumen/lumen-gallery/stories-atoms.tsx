'use client'

import { useState, type ReactNode } from 'react'
import {
  IconChevronRight,
  IconLoader2,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import type { LumenStory } from './types'

const FIELD =
  'rounded-lg border border-input bg-popover text-foreground placeholder:text-muted-foreground'

function Note({ children }: { children: ReactNode }) {
  return <p className="mb-3 max-w-xl text-sm text-muted-foreground">{children}</p>
}

function SwitchDemo({
  label,
  checked: checkedProp,
  disabled,
}: {
  label: string
  checked?: boolean
  disabled?: boolean
}) {
  const [on, setOn] = useState(!!checkedProp)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => setOn((v) => !v)}
      className={cn(
        'flex items-center gap-3 text-sm text-foreground disabled:opacity-50',
      )}
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          on ? 'bg-primary' : 'bg-input',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-4 rounded-full bg-background transition-transform',
            on && 'translate-x-4',
          )}
        />
      </span>
      {label}
    </button>
  )
}

export const ATOM_STORIES: LumenStory[] = [
  /* ───────────── Actions ───────────── */
  {
    id: 'actions-button',
    title: 'Button',
    group: 'Actions',
    description: 'Primary / outline / ghost — white focus rings, never blue.',
    importPath: '@/components/ui/button',
    code: `import { Button } from '@/components/ui/button'

<Button>Join & Play</Button>
<Button variant="outline">Maybe later</Button>`,
    render: () => (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Next">
            <IconChevronRight className="size-4" />
          </Button>
          <Button disabled>Disabled</Button>
          <Button>
            <IconLoader2 className="size-4 animate-spin" />
            Loading
          </Button>
        </div>
      </div>
    ),
  },
  {
    id: 'actions-icon-button',
    title: 'Icon Button',
    group: 'Actions',
    importPath: '@/components/ui/button',
    code: `<Button size="icon" variant="outline" aria-label="Add"><IconPlus /></Button>`,
    render: () => (
      <div className="flex flex-wrap gap-3">
        <Button size="icon" aria-label="Add">
          <IconPlus className="size-4" />
        </Button>
        <Button size="icon" variant="outline" aria-label="Search">
          <IconSearch className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Next">
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    ),
  },
  {
    id: 'actions-item',
    title: 'Item',
    group: 'Actions',
    description: 'List / menu row pattern — hover whisper surface.',
    importPath: 'list row pattern',
    code: `<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:!bg-surface-muted-3">…</button>`,
    render: () => (
      <div className="max-w-sm overflow-hidden rounded-[10px] border border-border bg-card">
        {['Rakeback', 'Weekly Boost', 'Refer a Friend'].map((label) => (
          <button
            key={label}
            type="button"
            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:!bg-surface-muted-3"
          >
            <span className="font-medium text-foreground">{label}</span>
            <IconChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    ),
  },

  /* ───────────── Utilities ───────────── */
  {
    id: 'util-backdrop',
    title: 'Backdrop',
    group: 'Utilities',
    importPath: 'overlay scrim',
    code: `<div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />`,
    render: () => (
      <div className="relative h-40 overflow-hidden rounded-[10px] border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-card" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <p className="text-sm text-white">Sheet / dialog scrim</p>
        </div>
      </div>
    ),
  },
  {
    id: 'util-instance-slot',
    title: 'Instance Slot',
    group: 'Utilities',
    description:
      'Figma authoring helper. In code: children / asChild / Slot — Button, DialogTrigger, etc.',
    importPath: '@radix-ui/react-slot',
    code: `<Button asChild><Link href="/casino">Casino</Link></Button>`,
    render: () => (
      <Note>
        Instance Slot is a Figma swap target. In React use <code className="text-foreground">asChild</code>{' '}
        / render props — not a separate visual component.
      </Note>
    ),
  },
  {
    id: 'util-scroll-area',
    title: 'Scroll-Area',
    group: 'Utilities',
    description: 'Product scroll uses #shell-scroll / .shell-scroll.',
    importPath: '#shell-scroll',
    code: `<div id="shell-scroll" className="shell-scroll overflow-y-auto">…</div>`,
    render: () => (
      <div className="shell-scroll h-40 overflow-y-auto rounded-[10px] border border-border bg-card p-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <p key={i} className="py-1 text-sm text-muted-foreground">
            Scroll row {i + 1}
          </p>
        ))}
      </div>
    ),
  },
  {
    id: 'util-separator',
    title: 'Separator (Divider)',
    group: 'Utilities',
    importPath: '@/components/ui/separator',
    code: `import { Separator } from '@/components/ui/separator'`,
    render: () => (
      <div className="max-w-sm space-y-3">
        <p className="text-sm">Above</p>
        <Separator />
        <p className="text-sm text-muted-foreground">Below</p>
      </div>
    ),
  },
  {
    id: 'util-spinner',
    title: 'Spinner',
    group: 'Utilities',
    description: 'Tile / soft-nav spinner — border spin, not a third-party loader.',
    importPath: 'TileSpinner pattern',
    code: `<span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />`,
    render: () => (
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="inline-block size-4 animate-spin rounded-full border-2 border-foreground border-t-transparent"
        />
        <span
          aria-hidden
          className="inline-block size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
        <Button disabled>
          <IconLoader2 className="size-4 animate-spin" />
          Claiming…
        </Button>
      </div>
    ),
  },
  {
    id: 'util-skeleton',
    title: 'Skeleton',
    group: 'Utilities',
    importPath: '@/components/ui/skeleton',
    code: `<Skeleton className="h-[207px] w-[152px] rounded-[10px]" />`,
    render: () => (
      <div className="flex gap-3">
        <Skeleton className="h-[207px] w-[152px] shrink-0 rounded-[10px]" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded-[10px]" />
          <Skeleton className="h-4 w-56 rounded-md" />
          <Skeleton className="h-4 w-44 rounded-md" />
        </div>
      </div>
    ),
  },

  /* ───────────── Inputs ───────────── */
  {
    id: 'input-radio',
    title: 'Radio',
    group: 'Inputs',
    importPath: 'radio group pattern',
    code: `<label className="flex items-center gap-2"><input type="radio" name="x" className="accent-primary" /> Option</label>`,
    render: () => {
      const Demo = () => {
        const [v, setV] = useState('a')
        return (
          <div className="space-y-2">
            {[
              ['a', 'Cash'],
              ['b', 'Free spins'],
              ['c', 'Nothing'],
            ].map(([id, label]) => (
              <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="lg-radio"
                  checked={v === id}
                  onChange={() => setV(id)}
                  className="size-4 accent-[var(--primary)]"
                />
                {label}
              </label>
            ))}
          </div>
        )
      }
      return <Demo />
    },
  },
  {
    id: 'input-combobox',
    title: 'Combobox (dropdown)',
    group: 'Inputs',
    description: 'Select primitive — same as Filter by / Sort by.',
    importPath: '@/components/ui/select',
    code: `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'`,
    render: () => (
      <Select defaultValue="all">
        <SelectTrigger className={cn('w-[200px]', FIELD)}>
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="casino">Casino</SelectItem>
          <SelectItem value="sports">Sports</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    id: 'input-text',
    title: 'Text-Input',
    group: 'Inputs',
    description: 'On cards: border-input bg-popover (cashier pattern).',
    importPath: '@/components/ui/input',
    code: `<Input className="rounded-lg border border-input bg-popover" />`,
    render: () => (
      <div className="max-w-sm space-y-3 rounded-[10px] border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label htmlFor="lg-email">Email</Label>
          <Input id="lg-email" className={FIELD} placeholder="you@email.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lg-user">Username</Label>
          <Input id="lg-user" className={FIELD} placeholder="player_01" />
        </div>
      </div>
    ),
  },
  {
    id: 'input-file',
    title: 'File-Input',
    group: 'Inputs',
    importPath: 'file input',
    code: `<Input type="file" className="rounded-lg border border-input bg-popover" />`,
    render: () => (
      <Input type="file" className={cn('max-w-sm', FIELD)} />
    ),
  },
  {
    id: 'input-checkbox',
    title: 'Checkbox',
    group: 'Inputs',
    importPath: '@/components/ui/checkbox',
    code: `<Checkbox className="size-[18px] rounded-[4px] border-input" />`,
    render: () => {
      const Demo = () => {
        const [on, setOn] = useState(true)
        return (
          <label className="flex cursor-pointer items-center gap-3">
            <Checkbox
              checked={on}
              onCheckedChange={(v) => setOn(v === true)}
              className="size-[18px] rounded-[4px] border-input"
            />
            <span className="text-sm">I acknowledge that I am over 18</span>
          </label>
        )
      }
      return <Demo />
    },
  },
  {
    id: 'input-otp',
    title: 'OTP-Input',
    group: 'Inputs',
    importPath: 'OTP pattern',
    code: `/* Six digit cells — security / 2FA */`,
    render: () => (
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Input
            key={i}
            maxLength={1}
            className={cn('size-10 text-center', FIELD)}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
    ),
  },
  {
    id: 'input-date',
    title: 'Date-Picker-Input',
    group: 'Inputs',
    description: 'VIP birthday uses MM / DD / YY fields — not a calendar popup by default.',
    importPath: 'DOB fields',
    code: `<Input placeholder="MM" /> <Input placeholder="DD" /> <Input placeholder="YY" />`,
    render: () => (
      <div className="flex max-w-xs gap-2">
        <Input className={cn('w-16', FIELD)} placeholder="MM" aria-label="Month" />
        <Input className={cn('w-16', FIELD)} placeholder="DD" aria-label="Day" />
        <Input className={cn('w-20', FIELD)} placeholder="YY" aria-label="Year" />
      </div>
    ),
  },
  {
    id: 'input-textarea',
    title: 'Text-Area',
    group: 'Inputs',
    importPath: 'textarea',
    code: `<textarea className="rounded-lg border border-input bg-popover …" />`,
    render: () => (
      <textarea
        className={cn('min-h-[100px] w-full max-w-md px-3 py-2 text-sm', FIELD)}
        placeholder="Message support…"
      />
    ),
  },
  {
    id: 'input-select',
    title: 'Select',
    group: 'Inputs',
    importPath: '@/components/ui/select',
    code: `import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'`,
    render: () => (
      <Select defaultValue="10">
        <SelectTrigger className={cn('w-[160px]', FIELD)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 / page</SelectItem>
          <SelectItem value="25">25 / page</SelectItem>
          <SelectItem value="50">50 / page</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    id: 'input-search',
    title: 'Search Box',
    group: 'Inputs',
    importPath: '@/components/ui/input',
    code: `<div className="relative"><IconSearch className="absolute …" /><Input className="pl-9" /></div>`,
    render: () => (
      <div className="relative max-w-sm">
        <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className={cn(FIELD, 'pl-9')} placeholder="Search games…" />
      </div>
    ),
  },
  {
    id: 'input-slider',
    title: 'Slider',
    group: 'Inputs',
    importPath: 'range input',
    code: `<input type="range" className="w-full accent-[var(--primary)]" />`,
    render: () => {
      const Demo = () => {
        const [v, setV] = useState(40)
        return (
          <div className="max-w-sm space-y-2">
            <p className="text-xs text-muted-foreground">Progress {v}%</p>
            <input
              type="range"
              min={0}
              max={100}
              value={v}
              onChange={(e) => setV(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
        )
      }
      return <Demo />
    },
  },
  {
    id: 'input-switch',
    title: 'Switch',
    group: 'Inputs',
    importPath: 'switch pattern',
    code: `role="switch" + primary track`,
    render: () => (
      <div className="flex flex-col gap-3">
        <SwitchDemo label="Dark mode" checked />
        <SwitchDemo label="Sound effects" />
        <SwitchDemo label="Disabled" disabled />
      </div>
    ),
  },
  {
    id: 'input-toggle',
    title: 'Toggle',
    group: 'Inputs',
    importPath: '@/components/ui/toggle',
    code: `import { Toggle } from '@/components/ui/toggle'`,
    render: () => (
      <div className="flex gap-2">
        <Toggle aria-label="Bold" defaultPressed>
          B
        </Toggle>
        <Toggle aria-label="Italic">I</Toggle>
      </div>
    ),
  },
  {
    id: 'input-toggle-group',
    title: 'Toggle Group',
    group: 'Inputs',
    description: 'Same idea as promo filter pills / account sub-nav thumb.',
    importPath: 'pill track',
    code: `/* See AccountSubNav / PromoFilterTrack — motion thumb */`,
    render: () => {
      const Demo = () => {
        const [v, setV] = useState('all')
        const items = [
          ['all', 'All'],
          ['casino', 'Casino'],
          ['sports', 'Sports'],
        ] as const
        return (
          <div className="inline-flex rounded-full bg-secondary p-0.5">
            {items.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setV(id)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm transition-colors',
                  v === id
                    ? 'bg-primary font-medium text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )
      }
      return <Demo />
    },
  },
  {
    id: 'input-number',
    title: 'Number-Input',
    group: 'Inputs',
    importPath: '@/components/ui/input',
    code: `<Input type="number" className="rounded-lg border border-input bg-popover" />`,
    render: () => (
      <Input type="number" defaultValue={20} className={cn('max-w-[120px]', FIELD)} />
    ),
  },

  /* ───────────── System States ───────────── */
  {
    id: 'sys-alert',
    title: 'Alert',
    group: 'System States',
    importPath: '@/components/ui/alert',
    code: `import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'`,
    render: () => (
      <Alert className="max-w-lg">
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>
          Deposit confirms in 2/2 blocks — balance updates when confirmed.
        </AlertDescription>
      </Alert>
    ),
  },
  {
    id: 'sys-sonner',
    title: 'Sonner',
    group: 'System States',
    description: 'Claim / balance toasts — same Toaster as the live site.',
    importPath: '@/components/ui/sonner',
    code: `import { toast } from 'sonner'\ntoast.success('Claimed $12.40')`,
    render: () => (
      <div data-lumen-allow="" className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => toast.success('Claimed $12.40 rakeback')}>
          Success toast
        </Button>
        <Button type="button" variant="outline" onClick={() => toast.message('Copied address')}>
          Neutral toast
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => toast.error('Something went wrong')}
        >
          Error toast
        </Button>
      </div>
    ),
  },
  {
    id: 'sys-alert-dialog',
    title: 'Alert Dialog',
    group: 'System States',
    description: 'Confirm destructive actions — security remove device pattern.',
    importPath: 'dialog confirm',
    code: `/* Prefer controlled Sheet/Dialog with primary + outline Cancel */`,
    render: () => (
      <div className="max-w-sm space-y-4 rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-semibold">Remove this device?</p>
        <p className="text-sm text-muted-foreground">
          You’ll need to sign in again on that device.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Remove</Button>
        </div>
      </div>
    ),
  },
  {
    id: 'sys-calendar',
    title: 'Calendar',
    group: 'System States',
    importPath: 'calendar',
    code: `/* Contests / schedules — month grid */`,
    render: () => (
      <div className="grid max-w-xs grid-cols-7 gap-1 rounded-[10px] border border-border bg-card p-3 text-center text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <span key={d} className="py-1 text-muted-foreground">
            {d}
          </span>
        ))}
        {Array.from({ length: 28 }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'rounded-md py-1.5 hover:bg-accent',
              i + 1 === 12 && 'bg-primary text-primary-foreground',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'sys-dialog',
    title: 'Dialog (pop-up)',
    group: 'System States',
    description: 'Auth / Daily Spin / welcome use dedicated modals — see Sheets & drawers.',
    importPath: 'AuthModal · DailySpinModal',
    code: `/* Live: open Auth / Daily Spin from Sheets & drawers → Live sheets */`,
    render: () => (
      <Note>
        Centered dialogs on :3000 are Auth, Daily Spin, welcome, churn rescue — open them from{' '}
        <strong className="text-foreground">Live sheets & modals</strong>.
      </Note>
    ),
  },
  {
    id: 'sys-tooltip',
    title: 'Tooltip',
    group: 'System States',
    importPath: '@/components/ui/tooltip · lumen-tooltip',
    code: `import { LumenTooltip } from '@/components/ui/lumen-tooltip'`,
    render: () => (
      <TooltipProvider>
        <div className="flex flex-wrap gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Radix tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>Helper copy</TooltipContent>
          </Tooltip>
          <LumenTooltip label="Loyalty tip — same as My Account info">
            <Button variant="secondary">Lumen tooltip</Button>
          </LumenTooltip>
        </div>
      </TooltipProvider>
    ),
  },
  {
    id: 'sys-progress',
    title: 'Progress',
    group: 'System States',
    importPath: '@/components/ui/progress',
    code: `<Progress value={40} />`,
    render: () => (
      <div className="max-w-sm space-y-2">
        <p className="text-xs text-muted-foreground">Bronze → Silver · 40%</p>
        <Progress value={40} />
      </div>
    ),
  },
  {
    id: 'sys-popover',
    title: 'Popover',
    group: 'System States',
    importPath: '@/components/ui/popover',
    code: `import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'`,
    render: () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 text-sm">
          Filters, menus, and light overlays land here.
        </PopoverContent>
      </Popover>
    ),
  },
  {
    id: 'sys-hover-card',
    title: 'Hover Card',
    group: 'System States',
    importPath: '@/components/ui/hover-card',
    code: `import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'`,
    render: () => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link">@vip</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <p className="text-sm font-semibold">VIP Host</p>
          <p className="text-xs text-muted-foreground">Exclusive benefits unlock as you climb.</p>
        </HoverCardContent>
      </HoverCard>
    ),
  },

  /* ───────────── Data Display ───────────── */
  {
    id: 'data-accordion',
    title: 'Accordion',
    group: 'Data Display',
    importPath: '@/components/ui/accordion',
    code: `import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'`,
    render: () => (
      <Accordion type="single" collapsible className="max-w-md">
        <AccordionItem value="a">
          <AccordionTrigger value="a">How do free spins work?</AccordionTrigger>
          <AccordionContent value="a">
            Welcome free spins play Chicken — spins burn as you close the game.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger value="b">When does rakeback unlock?</AccordionTrigger>
          <AccordionContent value="b">After you open and close real-money games.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    id: 'data-avatar',
    title: 'Avatar',
    group: 'Data Display',
    importPath: '@/components/ui/avatar',
    code: `<Avatar><AvatarFallback>CH</AvatarFallback></Avatar>`,
    render: () => (
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">CH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback className="bg-secondary text-secondary-foreground">VIP</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    id: 'data-badge',
    title: 'Badge',
    group: 'Data Display',
    importPath: '@/components/ui/badge',
    code: `<Badge>New</Badge>`,
    render: () => (
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    ),
  },
  {
    id: 'data-dot-badge',
    title: 'Dot Badge',
    group: 'Data Display',
    description: 'Notification dots on crown / account — shell chrome.',
    importPath: 'shell notification dot',
    code: `<span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />`,
    render: () => (
      <div className="flex gap-6">
        <span className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary">
          VIP
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            1
          </span>
        </span>
        <span className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary">
          ●
          <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
        </span>
      </div>
    ),
  },
  {
    id: 'data-card',
    title: 'Card',
    group: 'Data Display',
    importPath: '@/components/ui/card',
    code: `import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'`,
    render: () => (
      <Card className="max-w-sm rounded-[10px] border-border shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <CardHeader>
          <CardTitle>VIP Rewards</CardTitle>
          <CardDescription>Climb every VIP rank from Bronze to Obsidian</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Rakeback, weekly boosts, and more.
        </CardContent>
        <CardFooter>
          <Button size="sm">Explore</Button>
        </CardFooter>
      </Card>
    ),
  },
  {
    id: 'data-carousel',
    title: 'Carousel',
    group: 'Data Display',
    description: 'Mobile = swipe only. Desktop may use glass arrows when pointer is fine.',
    importPath: '@/components/ui/carousel · lobby banners',
    code: `/* See Promo lobby banners · CasinoLobbyBannerRow */`,
    render: () => (
      <Note>
        Product carousels: lobby banners, Live Wins, shelves. Hard rule — no edge chevrons on
        mobile. Open <strong className="text-foreground">Promo lobby banners</strong> / Live Wins.
      </Note>
    ),
  },
  {
    id: 'data-chart',
    title: 'Chart',
    group: 'Data Display',
    description: '🚧 Trends / races charts — live on Casino Trends & Daily Races.',
    importPath: '@/components/lumen/casino-trends-page',
    code: `/* Casino Trends markets + Daily Races progress */`,
    demoHref: '/casino/trends',
    render: () => (
      <Note>
        Charts ship inside Trends and Daily Races pages — open those under Casino / Pages, not a
        detached Chart.js demo.
      </Note>
    ),
  },
  {
    id: 'data-collapsible',
    title: 'Collapsible',
    group: 'Data Display',
    importPath: 'accordion / details',
    code: `/* Prefer Accordion for FAQ-style collapses */`,
    render: () => {
      const Demo = () => {
        const [open, setOpen] = useState(false)
        return (
          <div className="max-w-md rounded-[10px] border border-border">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
              onClick={() => setOpen((o) => !o)}
            >
              Terms
              <IconChevronRight
                className={cn('size-4 transition-transform', open && 'rotate-90')}
              />
            </button>
            {open ? (
              <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                Collapsed body — same motion language as accordion.
              </p>
            ) : null}
          </div>
        )
      }
      return <Demo />
    },
  },
  {
    id: 'data-form',
    title: 'Form',
    group: 'Data Display',
    importPath: 'Label + Input + Button',
    code: `/* Join / Login fields in AuthModal */`,
    render: () => (
      <form
        className="max-w-sm space-y-3 rounded-[10px] border border-border bg-card p-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-1.5">
          <Label htmlFor="f-email">Email</Label>
          <Input id="f-email" className={FIELD} placeholder="you@email.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-pass">Password</Label>
          <Input id="f-pass" type="password" className={FIELD} placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full">
          Join & Play
        </Button>
      </form>
    ),
  },
  {
    id: 'data-form-wizard',
    title: 'Form Wizard',
    group: 'Data Display',
    description: 'Multi-step — cashier Activate / security flows.',
    importPath: 'stepper + panels',
    code: `/* Step indicator + panel — see Stepper */`,
    render: () => (
      <div className="max-w-md space-y-4">
        <div className="flex gap-2">
          {['Details', 'Verify', 'Done'].map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-xs font-semibold',
                  i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
                )}
              >
                {i + 1}
              </div>
              <span className="text-[10px] text-muted-foreground">{s}</span>
            </div>
          ))}
        </div>
        <div className="rounded-[10px] border border-border bg-card p-4 text-sm text-muted-foreground">
          Step 1 content
        </div>
      </div>
    ),
  },
  {
    id: 'data-pagination',
    title: 'Pagination',
    group: 'Data Display',
    description: 'Tables: Rows per page + Page N of M.',
    importPath: '@/components/ui/pagination',
    code: `import { Pagination, PaginationContent, … } from '@/components/ui/pagination'`,
    render: () => (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
  },
  {
    id: 'data-rating',
    title: 'Rating',
    group: 'Data Display',
    importPath: 'stars',
    code: `/* Star row — reviews / feedback */`,
    render: () => (
      <div className="flex gap-1 text-lg text-warning" aria-label="4 of 5">
        {'★★★★☆'}
      </div>
    ),
  },
  {
    id: 'data-stepper',
    title: 'Stepper',
    group: 'Data Display',
    importPath: 'stepper',
    code: `/* Horizontal steps — Form Wizard */`,
    render: () => (
      <div className="flex max-w-md items-center gap-2">
        {['Deposit', 'Confirm', 'Play'].map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                i <= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground',
              )}
            >
              {i + 1}
            </div>
            <span className="truncate text-xs text-muted-foreground">{s}</span>
            {i < 2 ? <div className="h-px flex-1 bg-border" /> : null}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'data-table',
    title: 'Table',
    group: 'Data Display',
    description: 'My Bonus / Transactions / Bet History pattern.',
    importPath: '@/components/ui/table',
    code: `import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'`,
    render: () => (
      <div className="overflow-hidden rounded-[10px] border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead>Bet</TableHead>
              <TableHead className="text-right">Payout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Plinko', '$2.00', '$14.40'],
              ['Dice', '$5.00', '$0.00'],
              ['Chicken', '$1.00', '$3.20'],
            ].map(([game, bet, payout]) => (
              <TableRow key={game} className="hover:!bg-surface-muted-3">
                <TableCell className="font-medium">{game}</TableCell>
                <TableCell className="text-muted-foreground">{bet}</TableCell>
                <TableCell className="text-right">{payout}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    ),
  },
  {
    id: 'data-context-menu',
    title: 'Context Menu',
    group: 'Data Display',
    description: '🚧 Review — prefer Dropdown Menu for product chrome.',
    importPath: '@/components/ui/dropdown-menu',
    code: `/* Right-click menus rare in product — use DropdownMenu */`,
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: 'data-timeline',
    title: 'Timeline',
    group: 'Data Display',
    description: '🚧 Sam review — transactions / history list pattern.',
    importPath: 'timeline list',
    code: `/* Vertical rail + events */`,
    render: () => (
      <ol className="relative max-w-sm space-y-4 border-l border-border pl-4">
        {[
          ['Deposit confirmed', '2 min ago'],
          ['Claimed rakeback', '1 hr ago'],
          ['Joined VIP', 'Yesterday'],
        ].map(([title, when]) => (
          <li key={title} className="relative">
            <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary" />
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{when}</p>
          </li>
        ))}
      </ol>
    ),
  },

  /* ───────────── Navigation atoms ───────────── */
  {
    id: 'nav-breadcrumbs',
    title: 'Breadcrumbs',
    group: 'Navigation',
    description: 'Atoms only — BetOnline shell uses product sub-navs, not breadcrumbs.',
    importPath: 'breadcrumb',
    code: `Casino / Slots / Sweet Bonanza`,
    render: () => (
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Casino</span>
        <IconChevronRight className="size-3.5" />
        <span>Slots</span>
        <IconChevronRight className="size-3.5" />
        <span className="text-foreground">Sweet Bonanza</span>
      </nav>
    ),
  },
  {
    id: 'nav-command',
    title: 'Command (Search Box)',
    group: 'Navigation',
    description: 'Casino search overlay is the product command surface.',
    importPath: '@/components/lumen/casino-search-overlay',
    demoHref: '/casino',
    code: `/* CasinoSearchOverlay on /casino */`,
    render: () => (
      <Note>
        Product search = casino search overlay (magnifier on glass sub-nav). Not a generic ⌘K
        palette.
      </Note>
    ),
  },
  {
    id: 'nav-dropdown',
    title: 'Dropdown Menu',
    group: 'Navigation',
    importPath: '@/components/ui/dropdown-menu',
    code: `import { DropdownMenu, … } from '@/components/ui/dropdown-menu'`,
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Other ▾</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Racebook</DropdownMenuItem>
          <DropdownMenuItem>Esports</DropdownMenuItem>
          <DropdownMenuItem>Contests</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    id: 'nav-sidebar-atom',
    title: 'Side Bar (Side Menu)',
    group: 'Navigation',
    description: 'shadcn Sidebar atom — product left rail is ShellSidebar under Shell.',
    importPath: '@/components/ui/sidebar · shell-sidebar',
    code: `/* Live product: ShellSidebar — open Shell → Sidebar */`,
    render: () => (
      <Note>
        Do not use the generic Sidebar demo as BetOnline chrome. Open{' '}
        <strong className="text-foreground">Shell → Sidebar</strong> for the live rail.
      </Note>
    ),
  },
  {
    id: 'nav-menubar',
    title: 'Menu-Bar',
    group: 'Navigation',
    description: '🚧 ? — header product tabs are ShellHeader, not Menubar.',
    importPath: 'ShellHeader',
    code: `/* HEADER_NAV in shell-header */`,
    render: () => (
      <Note>
        Top product tabs = <strong className="text-foreground">Shell → Main nav</strong>.
      </Note>
    ),
  },
  {
    id: 'nav-nav-menu',
    title: 'Nav-Menu',
    group: 'Navigation',
    importPath: '@/components/ui/navigation-menu',
    code: `import { NavigationMenu, … } from '@/components/ui/navigation-menu'`,
    render: () => (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink className="rounded-md px-3 py-2 text-sm">Casino</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className="rounded-md px-3 py-2 text-sm">Sports</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
  },
  {
    id: 'nav-tab-menu',
    title: 'Tab-Menu',
    group: 'Navigation',
    importPath: '@/components/ui/tabs',
    code: `import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'`,
    render: () => (
      <Tabs defaultValue="lobby" className="max-w-md">
        <TabsList>
          <TabsTrigger value="lobby">Lobby</TabsTrigger>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
        </TabsList>
        <TabsContent value="lobby" className="mt-3 text-sm text-muted-foreground">
          Lobby content
        </TabsContent>
        <TabsContent value="slots" className="mt-3 text-sm text-muted-foreground">
          Slots content
        </TabsContent>
        <TabsContent value="live" className="mt-3 text-sm text-muted-foreground">
          Live content
        </TabsContent>
      </Tabs>
    ),
  },

  /* ───────────── Others ───────────── */
  {
    id: 'others-block-heading',
    title: 'Block Heading',
    group: 'Others',
    importPath: 'section title',
    code: `<Typography shape="h2" weight="semibold">All Promotions</Typography>`,
    render: () => (
      <div className="space-y-1">
        <Typography shape="h2" weight="semibold">
          All Promotions
        </Typography>
        <p className="text-sm text-muted-foreground">Section intro — one job per block.</p>
      </div>
    ),
  },
  {
    id: 'others-page-header',
    title: 'Component Page Header',
    group: 'Others',
    description: 'This gallery canvas header — group · title · import · copy.',
    importPath: 'lumen-gallery-app',
    code: `/* StoryCanvas header in Lumen codebase */`,
    render: () => (
      <Note>You’re looking at it — sticky library chrome above every preview.</Note>
    ),
  },
  {
    id: 'others-misc',
    title: 'Misc',
    group: 'Others',
    importPath: 'misc',
    code: `/* Empty / edge utilities */`,
    render: () => (
      <div className="rounded-[10px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Misc tokens & helpers — prefer named foundations above.
      </div>
    ),
  },
]
