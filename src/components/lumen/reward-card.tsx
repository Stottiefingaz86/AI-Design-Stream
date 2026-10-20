import type { ReactNode, RefObject } from 'react';
import { InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export type RewardCardInfoData = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  infoText?: string;
  infoLabel?: string;
  termsLabel?: string;
  onTermsClick?: () => void;
};

export type RewardCardButtonAction = {
  disabled?: boolean;
  loading?: boolean;
  actionVariant?: 'primary' | 'secondary' | 'secondary-inverted';
  actionIcon?: ReactNode;
  actionLabel: string;
  buttonLabel?: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onClick?: () => void;
};

/** Default rakeback mark — circular arrows, same role as the Loyalty Hub icon. */
export function RakebackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={cn('size-4', className)}>
      <path
        d="M4.2 10a5.8 5.8 0 0 1 9.7-4.25M15.8 10a5.8 5.8 0 0 1-9.7 4.25"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M14.1 3.4v3.2h-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.9 16.6v-3.2h3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const rewardCardRakebackInfo: RewardCardInfoData = {
  icon: <RakebackIcon />,
  title: 'Rakeback',
  infoLabel: 'More information',
  infoText: 'Rakeback is calculated on your net losses and paid out daily.',
};

export const rewardCardIdleButtonAction: RewardCardButtonAction = {
  disabled: false,
  loading: false,
  actionVariant: 'primary',
  actionLabel: 'Claim $0.99',
  buttonLabel: 'Claiming reward',
};

export const rewardCardLoadingButtonAction: RewardCardButtonAction = {
  disabled: true,
  loading: true,
  actionVariant: 'primary',
  actionLabel: 'Claim $0.99',
  buttonLabel: 'Claiming reward',
};

const VARIANT = {
  primary: 'default',
  secondary: 'secondary',
  'secondary-inverted': 'outline',
} as const;

export function RewardCard({
  rewardInfo = rewardCardRakebackInfo,
  buttonAction = rewardCardIdleButtonAction,
  testId,
}: {
  rewardInfo?: RewardCardInfoData;
  buttonAction?: RewardCardButtonAction;
  testId?: string;
}) {
  const loading = Boolean(buttonAction.loading);
  const label = loading ? (buttonAction.buttonLabel ?? buttonAction.actionLabel) : buttonAction.actionLabel;
  const inverted = buttonAction.actionVariant === 'secondary-inverted';

  return (
    <article
      data-testid={testId}
      className="flex w-full items-center justify-between gap-3 rounded-3xl bg-muted px-4 py-2.5"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-background text-foreground">
          {rewardInfo.icon ?? <RakebackIcon />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-5 text-foreground">{rewardInfo.title}</p>
          {rewardInfo.subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{rewardInfo.subtitle}</p>
          ) : null}
        </div>
        {rewardInfo.infoText ? (
          <Popover>
            <PopoverTrigger
              aria-label={rewardInfo.infoLabel ?? 'More information'}
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <InfoIcon className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <PopoverDescription>{rewardInfo.infoText}</PopoverDescription>
              {rewardInfo.termsLabel ? (
                <button
                  type="button"
                  onClick={rewardInfo.onTermsClick}
                  className="text-left text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {rewardInfo.termsLabel}
                </button>
              ) : null}
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      <Button
        ref={buttonAction.buttonRef}
        variant={VARIANT[buttonAction.actionVariant ?? 'primary']}
        disabled={buttonAction.disabled || loading}
        onClick={buttonAction.onClick}
        className={cn(
          'rounded-full px-3.5',
          inverted && 'border-transparent bg-foreground text-background hover:bg-foreground/80 hover:text-background',
          loading && 'gap-2',
        )}
      >
        {loading ? <Spinner /> : buttonAction.actionIcon}
        {label}
      </Button>
    </article>
  );
}
