import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HeartIcon, Maximize2Icon, Minimize2Icon, XIcon } from 'lucide-react';
import { ParticleBurst } from './animations';
import { cn } from '@/lib/utils';

export function Favorite({
  favoriteLabel = 'Add game to favorites',
  unfavoriteLabel = 'Remove game from favorites',
  isFavorited = false,
  onFavoriteChange,
  className,
}: {
  favoriteLabel?: string;
  unfavoriteLabel?: string;
  isFavorited?: boolean;
  onFavoriteChange?: (next: boolean) => void;
  className?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [on, setOn] = useState(isFavorited);
  const [animating, setAnimating] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOn(isFavorited);
  }, [isFavorited]);

  const toggle = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !on;
    setOn(next);
    onFavoriteChange?.(next);
    if (next) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setAnimating(true);
    } else {
      setAnimating(false);
      setOrigin(null);
    }
  };

  const burst =
    mounted && animating && origin
      ? createPortal(
          <span
            className="twitter-heart-sprite is-animating pointer-events-none fixed z-[100200]"
            style={{
              left: origin.x,
              top: origin.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
            }}
            onAnimationEnd={() => {
              setAnimating(false);
              setOrigin(null);
            }}
            aria-hidden
          />,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-pressed={on}
        aria-label={on ? unfavoriteLabel : favoriteLabel}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggle(e);
        }}
        className={cn(
          'relative inline-flex size-8 items-center justify-center overflow-visible rounded-full',
          className,
        )}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full border border-border bg-background/80 shadow-sm backdrop-blur-md"
          aria-hidden
        />
        <ParticleBurst playing={animating} count={12}>
          <HeartIcon
            className={cn('relative z-10 size-4', on ? 'fill-primary text-primary' : 'text-foreground')}
            aria-hidden
          />
        </ParticleBurst>
      </button>
      {burst}
    </>
  );
}

const LAUNCHER_JACKPOTS = [
  { id: 'must', label: 'Must Drop', amount: '$8888.88', countdown: '00:38:18', tone: 'must' as const },
  { id: 'mini', label: 'Mini', amount: '$8888.88', tone: 'mini' as const },
  { id: 'minor', label: 'Minor', amount: '$8888.88', tone: 'minor' as const },
  { id: 'major', label: 'Major', amount: '$8888.88', tone: 'major' as const },
  { id: 'mega', label: 'Mega', amount: '$8888.88', tone: 'mega' as const },
];

const LAUNCHER_TIER_CLASS: Record<(typeof LAUNCHER_JACKPOTS)[number]['tone'], string> = {
  must: 'text-[var(--vip-rewards,#edc555)]',
  mega: 'bg-gradient-to-r from-[#ed9a63] via-[#eca545] to-[#d36913] bg-clip-text text-transparent',
  major: 'text-[#ec4899]',
  minor: 'text-[#06b6d4]',
  mini: 'text-[#22c55e]',
};

/** Casino Jackpot-in-Game-Header — title bar + jackpot row (Figma 47:341040). */
export function GameLauncher({
  gameName,
  closeLabel = 'Close game',
  exitFullscreenLabel = 'Exit fullscreen',
  favoriteLabel = 'Favorite game',
  fullscreenLabel = 'Enter fullscreen',
  spinLabel = '+$0.35/spin',
  showJackpot = true,
  onClose,
  onFavoriteChange,
  onFullscreen,
  testId = 'game-launcher',
  children,
}: {
  gameName: string;
  closeLabel?: string;
  exitFullscreenLabel?: string;
  favoriteLabel?: string;
  fullscreenLabel?: string;
  spinLabel?: string;
  showJackpot?: boolean;
  onClose?: () => void;
  onFavoriteChange?: (next: boolean) => void;
  onFullscreen?: () => void;
  testId?: string;
  children?: ReactNode;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [optIn, setOptIn] = useState(true);
  return (
    <div
      data-testid={testId}
      data-brand="betonline"
      className="dark flex h-full w-full flex-col gap-3 bg-[#0a0a0a] p-3 text-[rgba(255,255,255,0.87)] sm:p-4"
    >
      <header
        data-name="jackpot-header"
        className="flex shrink-0 flex-col overflow-hidden rounded-[14px] border border-white/10 bg-[#212121]"
      >
        <div className="flex items-center justify-between gap-2 p-2">
          <strong className="min-w-0 flex-1 truncate text-center text-sm font-medium text-[rgba(255,255,255,0.87)] md:flex-none">
            {gameName}
          </strong>
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <div className="flex items-center overflow-hidden rounded-full border border-border py-px">
              <span className="inline-flex h-6 items-center gap-1 px-2 text-xs font-medium text-[rgba(255,255,255,0.87)]">
                {spinLabel}
              </span>
              <span className="h-4 w-px bg-border" aria-hidden />
              <button
                type="button"
                role="switch"
                aria-checked={optIn}
                aria-label="Opt into jackpot"
                onClick={() => setOptIn((v) => !v)}
                className="px-2"
              >
                <span
                  className={cn(
                    'relative block h-[18px] w-8 rounded-full transition-colors',
                    optIn ? 'bg-primary' : 'bg-white/20',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-px size-4 rounded-full bg-white transition-transform',
                      optIn ? 'left-[14px]' : 'left-px',
                    )}
                  />
                </span>
              </button>
            </div>
            <Favorite favoriteLabel={favoriteLabel} onFavoriteChange={onFavoriteChange} />
            <button
              type="button"
              aria-label={fullscreen ? exitFullscreenLabel : fullscreenLabel}
              onClick={() => {
                setFullscreen((v) => !v);
                onFullscreen?.();
              }}
              className="inline-flex size-8 items-center justify-center rounded-md text-[rgba(255,255,255,0.87)] hover:bg-white/10"
            >
              {fullscreen ? <Minimize2Icon className="size-4" /> : <Maximize2Icon className="size-4" />}
            </button>
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className="inline-flex size-8 items-center justify-center rounded-md text-[rgba(255,255,255,0.87)] hover:bg-white/10"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>
        {showJackpot ? (
          <>
            <div className="h-px w-full bg-border" aria-hidden />
            <div data-name="jackpot-row" className="flex h-8 w-full items-center" role="list" aria-label="Jackpot tiers">
              {LAUNCHER_JACKPOTS.map((item, index) => {
                const isMust = item.tone === 'must';
                return (
                  <div key={item.id} className="flex h-full min-w-0 flex-1 items-stretch">
                    {index > 0 ? <span className="w-px shrink-0 self-stretch bg-border" aria-hidden /> : null}
                    <div
                      data-name="jackpot-label"
                      role="listitem"
                      className={cn(
                        'flex h-full min-w-0 flex-1 items-center justify-center gap-1 px-2 text-sm font-bold leading-5',
                        isMust &&
                          'bg-[linear-gradient(90deg,#792400_0%,#a66336_25%,#a65615_50%,#c48633_75%,#792f00_100%)]',
                      )}
                    >
                      {isMust ? (
                        <>
                          <img src="/casino/jackpot-fire.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
                          <span className={LAUNCHER_TIER_CLASS.must}>{item.label.toUpperCase()}</span>
                          <span className="text-white">{item.amount}</span>
                          {'countdown' in item && item.countdown ? (
                            <span className="hidden text-[10px] font-semibold text-[var(--vip-rewards,#edc555)] sm:inline">
                              in {item.countdown}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="hidden items-center gap-1 md:inline-flex">
                          <span className={LAUNCHER_TIER_CLASS[item.tone]}>{item.label.toUpperCase()}</span>
                          <span className="text-[rgba(255,255,255,0.87)]">{item.amount}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[14px] bg-surface-muted-5">{children}</div>
    </div>
  );
}
