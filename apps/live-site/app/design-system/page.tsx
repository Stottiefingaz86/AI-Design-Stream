'use client'

/**
 * Lumen on the live site — verification page.
 * Every swatch and component below reads the CSS variables generated from the
 * Figma token exports (app/lumen.css). If this page looks right, the site is on Lumen.
 */
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const SEMANTIC = [
  'background',
  'foreground',
  'card',
  'popover',
  'primary',
  'secondary',
  'muted',
  'accent',
  'destructive',
  'border',
  'input',
  'ring',
  'success',
  'warning',
  'info',
  'link',
  'live',
  'featured',
  'vip-rewards',
  'header',
  'footer',
  'surface-muted-1',
  'surface-muted-2',
  'surface-muted-3',
  'chart-1',
  'chart-2',
  'chart-3',
]

function Swatch({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-2">
      <span className="h-9 w-9 shrink-0 rounded-md border border-border" style={{ background: `var(--${name})` }} />
      <code className="truncate text-xs text-muted-foreground">--{name}</code>
    </div>
  )
}

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme()
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7 rounded-md bg-primary" aria-hidden />
            <span className="text-sm font-bold uppercase tracking-wider">BetOnline · live site</span>
            <Badge variant="secondary">Lumen tokens</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
            <Button size="sm">Join now</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <section>
          <h1 className="text-3xl font-bold">Design system check</h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            This page renders the site&apos;s shadcn components with the Lumen variables compiled from the Figma plugin exports.
            Brand <code>betonline</code>, mode <code>{theme}</code>. Toggle the mode to confirm both token sets.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Semantic colours</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {SEMANTIC.map((n) => (
              <Swatch key={n} name={n} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Badges</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-live text-live-foreground hover:bg-live">Live</Badge>
            <Badge className="bg-featured text-featured-foreground hover:bg-featured">Featured</Badge>
            <Badge className="bg-success text-success-foreground hover:bg-success">Success</Badge>
            <Badge className="bg-vip-rewards text-vip-rewards-foreground hover:bg-vip-rewards">VIP</Badge>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Bet slip</CardTitle>
              <CardDescription>Card, inputs and progress on Lumen surfaces.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="stake">Stake</Label>
                <Input id="stake" placeholder="0.00" />
              </div>
              <div className="flex gap-2">
                {['10', '25', '50', '100'].map((c, i) => (
                  <Button key={c} size="sm" variant={i === 1 ? 'default' : 'outline'}>
                    {c}
                  </Button>
                ))}
              </div>
              <Progress value={64} />
              <Button className="w-full">Place bet · 4.20</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabs & table</CardTitle>
              <CardDescription>Data components under the betonline palette.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cash">
                <TabsList>
                  <TabsTrigger value="cash">Cash games</TabsTrigger>
                  <TabsTrigger value="tour">Tournaments</TabsTrigger>
                </TabsList>
                <TabsContent value="cash">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead>Stakes</TableHead>
                        <TableHead className="text-right">Seats</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        ['Vegas 1', '$0.25/$0.50', '6/9'],
                        ['Rio', '$1/$2', '4/6'],
                        ['Aria High', '$5/$10', '9/9'],
                      ].map((r) => (
                        <TableRow key={r[0]}>
                          <TableCell className="font-medium">{r[0]}</TableCell>
                          <TableCell>{r[1]}</TableCell>
                          <TableCell className="text-right">{r[2]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="tour">
                  <p className="py-6 text-sm text-muted-foreground">Tournament lobby — built by the agents from the next PRD.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </div>

      <footer className="border-t border-border bg-footer">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>Tokens: tokens/figma/*.json → scripts/sync-tokens.mjs → app/lumen.css</span>
          <span>Lumen · betonline</span>
        </div>
      </footer>
    </main>
  )
}
