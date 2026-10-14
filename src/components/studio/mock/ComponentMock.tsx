'use client';

/**
 * Storybook-style view of a component brief: every variant × size × state,
 * rendered with the Lumen primitives from `@/components/lumen`.
 * The same primitives are what Storybook (:6006) documents.
 */
import type { MockSpec } from '@/lib/studio/mock';
import { Badge, Button, Card, Chip, Input, Surface } from '@/components/lumen';
import type { ButtonVariant, ButtonSize } from '@/components/lumen';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'destructive'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-center gap-4 border-b border-border py-3 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function ButtonStories({ spec }: { spec: MockSpec }) {
  return (
    <>
      {VARIANTS.map((v) => (
        <Row key={v} label={v}>
          {SIZES.map((s) => (
            <Button key={s} variant={v} size={s}>
              {spec.primaryAction}
            </Button>
          ))}
          <Button variant={v} disabled>
            Disabled
          </Button>
        </Row>
      ))}
    </>
  );
}

function BadgeStories() {
  return (
    <Row label="tones">
      <Badge>Default</Badge>
      <Badge tone="live">Live</Badge>
      <Badge tone="featured">Featured</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="vip">VIP</Badge>
    </Row>
  );
}

function InputStories({ spec }: { spec: MockSpec }) {
  return (
    <>
      <Row label="default">
        <Input />
      </Row>
      <Row label="filled">
        <Input value={spec.title} />
      </Row>
      <Row label="focus">
        <Input value={spec.title} state="focus" />
      </Row>
      <Row label="error">
        <Input value="Invalid value" state="error" hint="Required field" />
      </Row>
      <Row label="disabled">
        <Input value="Disabled" state="disabled" />
      </Row>
    </>
  );
}

function ChipStories({ spec }: { spec: MockSpec }) {
  const chips = spec.items.length > 2 ? spec.items.slice(0, 4) : ['10', '25', '50', '100'];
  return (
    <>
      <Row label="default">
        {chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </Row>
      <Row label="selected">
        {chips.map((c, i) => (
          <Chip key={c} selected={i === 1}>
            {c}
          </Chip>
        ))}
      </Row>
      <Row label="disabled">
        {chips.map((c) => (
          <Chip key={c} disabled>
            {c}
          </Chip>
        ))}
      </Row>
    </>
  );
}

function CardStories({ spec }: { spec: MockSpec }) {
  return (
    <Row label="variants">
      {(['default', 'featured', 'live'] as const).map((k, i) => (
        <Card key={k} variant={k} title={spec.items[i] ?? spec.title} action={spec.primaryAction} />
      ))}
    </Row>
  );
}

function SurfaceStories({ spec }: { spec: MockSpec }) {
  return (
    <>
      <Row label="surface">
        <Surface title={spec.title} body={spec.summary}>
          <Button size="sm">{spec.primaryAction}</Button>
          <Button size="sm" variant="ghost">
            {spec.secondaryAction}
          </Button>
        </Surface>
      </Row>
      <Row label="muted">
        <Surface title={spec.title} body={spec.summary} muted />
      </Row>
    </>
  );
}

export function ComponentMock({ spec }: { spec: MockSpec }) {
  const Stories = {
    button: ButtonStories,
    badge: BadgeStories,
    input: InputStories,
    chip: ChipStories,
    card: CardStories,
    surface: SurfaceStories,
  }[spec.archetype];
  return (
    <main className="min-h-screen bg-background p-6 font-sans text-foreground md:p-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Lumen / {spec.archetype}</span>
          <h1 className="text-2xl font-bold">{spec.title}</h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">{spec.summary}</p>
        </div>
        <Badge tone="success">
          {spec.brand} · {spec.mode}
        </Badge>
      </header>
      <section className="rounded-lg border border-border bg-card px-5 py-2 text-card-foreground">
        <Stories spec={spec} />
      </section>
    </main>
  );
}
