import { useState, type ReactNode } from 'react';
import { HeartIcon, Maximize2Icon, Minimize2Icon, XIcon } from 'lucide-react';

export function Favorite({
  favoriteLabel = 'Add game to favorites',
  unfavoriteLabel = 'Remove game from favorites',
  isFavorited = false,
  onFavoriteChange,
}: {
  favoriteLabel?: string;
  unfavoriteLabel?: string;
  isFavorited?: boolean;
  onFavoriteChange?: (next: boolean) => void;
}) {
  const [on, setOn] = useState(isFavorited);
  const next = !on;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? unfavoriteLabel : favoriteLabel}
      onClick={() => {
        setOn(next);
        onFavoriteChange?.(next);
      }}
      className="inline-flex size-8 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition hover:bg-accent"
    >
      <HeartIcon className={`size-4 ${on ? 'fill-primary text-primary' : ''}`} />
    </button>
  );
}

export function GameLauncher({
  gameName,
  closeLabel = 'Close game',
  exitFullscreenLabel = 'Exit fullscreen',
  favoriteLabel = 'Favorite game',
  fullscreenLabel = 'Enter fullscreen',
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
  onClose?: () => void;
  onFavoriteChange?: (next: boolean) => void;
  onFullscreen?: () => void;
  testId?: string;
  children?: ReactNode;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <div data-testid={testId} className="flex h-full w-full flex-col bg-background text-foreground">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
        <strong className="min-w-0 flex-1 truncate text-sm font-semibold">{gameName}</strong>
        <Favorite favoriteLabel={favoriteLabel} onFavoriteChange={onFavoriteChange} />
        <button
          type="button"
          aria-label={fullscreen ? exitFullscreenLabel : fullscreenLabel}
          onClick={() => {
            setFullscreen((v) => !v);
            onFullscreen?.();
          }}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {fullscreen ? <Minimize2Icon className="size-4" /> : <Maximize2Icon className="size-4" />}
        </button>
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </header>
      <div className="min-h-0 flex-1 bg-surface-muted-5">{children}</div>
    </div>
  );
}
