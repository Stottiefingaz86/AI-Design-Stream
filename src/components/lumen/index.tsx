/**
 * Lumen layer on top of shadcn/studio.
 * Core primitives live in `@/components/ui` (installed from the shadcn + shadcn-studio registries).
 * This file only maps Lumen names (primary, live, vip…) onto those primitives — no second button.
 */
import type { ReactNode } from 'react';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Button as UiButton } from '@/components/ui/button';
import { Card as UiCard, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input as UiInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

export { Button as ShadcnButton, buttonVariants } from '@/components/ui/button';
export { Badge as ShadcnBadge, badgeVariants } from '@/components/ui/badge';
export { Input as ShadcnInput } from '@/components/ui/input';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANT = { primary: 'default', secondary: 'secondary', outline: 'outline', ghost: 'ghost', destructive: 'destructive' } as const;
const BUTTON_SIZE = { sm: 'sm', md: 'default', lg: 'lg' } as const;

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  onClick,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <UiButton variant={BUTTON_VARIANT[variant]} size={BUTTON_SIZE[size]} disabled={disabled} onClick={onClick}>
      {children}
    </UiButton>
  );
}

export type BadgeTone = 'muted' | 'live' | 'featured' | 'success' | 'vip' | 'warning' | 'info';

const BADGE_TONE: Record<BadgeTone, string> = {
  muted: '',
  live: 'bg-live text-live-foreground hover:bg-live',
  featured: 'bg-featured text-featured-foreground hover:bg-featured',
  success: 'bg-success text-success-foreground hover:bg-success',
  vip: 'bg-vip-rewards text-vip-rewards-foreground hover:bg-vip-rewards',
  warning: 'bg-warning text-warning-foreground hover:bg-warning',
  info: 'bg-info text-info-foreground hover:bg-info',
};

export function Badge({ tone = 'muted', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <UiBadge variant={tone === 'muted' ? 'secondary' : 'default'} className={BADGE_TONE[tone] || undefined}>
      {children}
    </UiBadge>
  );
}

export type InputState = 'default' | 'focus' | 'error' | 'disabled';

export function Input({
  label,
  placeholder = 'Placeholder…',
  value,
  state = 'default',
  hint,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  state?: InputState;
  hint?: string;
}) {
  return (
    <Field data-invalid={state === 'error' || undefined} data-disabled={state === 'disabled' || undefined} className="w-64">
      {label ? <FieldLabel>{label}</FieldLabel> : <Label className="sr-only">{placeholder}</Label>}
      <UiInput placeholder={placeholder} defaultValue={value} disabled={state === 'disabled'} aria-invalid={state === 'error' || undefined} />
      {hint ? state === 'error' ? <FieldError>{hint}</FieldError> : <FieldDescription>{hint}</FieldDescription> : null}
    </Field>
  );
}

export function Chip({ children, selected, disabled }: { children: ReactNode; selected?: boolean; disabled?: boolean }) {
  return (
    <UiButton type="button" variant={selected ? 'default' : 'outline'} size="sm" disabled={disabled}>
      {children}
    </UiButton>
  );
}

export type CardVariant = 'default' | 'featured' | 'live';

export function Card({ title, action, variant = 'default', description }: { title: string; action: string; variant?: CardVariant; description?: string }) {
  return (
    <UiCard className="w-56">
      <div className="aspect-[4/3] bg-surface-muted-2" />
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="truncate">{title}</CardTitle>
          {variant === 'live' ? <Badge tone="live">Live</Badge> : variant === 'featured' ? <Badge tone="featured">New</Badge> : null}
        </div>
      </CardHeader>
      {description ? <CardContent className="text-xs text-muted-foreground">{description}</CardContent> : null}
      <CardFooter>
        <Button size="sm" variant={variant === 'default' ? 'secondary' : 'primary'}>
          {action}
        </Button>
      </CardFooter>
    </UiCard>
  );
}

export function Surface({ title, body, muted, children }: { title: string; body?: string; muted?: boolean; children?: ReactNode }) {
  return (
    <UiCard className={muted ? 'w-72 bg-surface-muted-1 ring-0' : 'w-72'}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {body ? <p className="text-sm text-muted-foreground">{body}</p> : null}
      </CardHeader>
      {children ? <CardContent className="flex gap-2">{children}</CardContent> : null}
    </UiCard>
  );
}
