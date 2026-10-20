import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { PathnameProvider } from '../../../../.storybook/mocks/next-navigation';
import { ShellProvider, useShell } from '../../../../apps/live-site/components/site/shell-context';
import { ShellHeader } from '../../../../apps/live-site/components/site/shell-header';
import { ShellSidebar } from '../../../../apps/live-site/components/site/shell-sidebar';
import { cn } from '@/lib/utils';
import { CasinoLobbySkeleton } from '@/components/lumen/casino-lobby-skeleton';
import { CasinoSearchOverlay } from '../../../../apps/live-site/components/lumen/casino-search-overlay';
import { CasinoSubNav, type CasinoSubNavOptions } from '@/components/lumen/casino-sub-nav';
import { TooltipProvider } from '@/components/ui/tooltip';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Casino/Sub Nav',
  component: CasinoSubNav,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CasinoSubNav>;
export default meta;
type Story = StoryObj<typeof meta>;

function SubNavFrameBody({ subNav }: { subNav?: CasinoSubNavOptions }) {
  const { casinoSearchOpen, setCasinoSearchOpen } = useShell();
  return (
    <>
      <CasinoSubNav {...subNav} />
      <div className="mx-auto max-w-[1344px] space-y-4 px-6 py-8">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="h-24 rounded-lg bg-surface-muted-1" />
        ))}
      </div>
      <CasinoSearchOverlay open={casinoSearchOpen} onClose={() => setCasinoSearchOpen(false)} />
    </>
  );
}

function SubNavFrame({
  subNav,
  withSidebar = false,
  mode,
}: {
  subNav?: CasinoSubNavOptions;
  withSidebar?: boolean;
  /** Pins betonline + light/dark on `<html>` for this frame (Storybook Dark stories). */
  mode?: 'light' | 'dark';
}) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.brand = 'betonline';
    if (mode) html.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return (
    <PathnameProvider pathname="/casino">
      <ShellProvider loggedIn>
        <TooltipProvider delayDuration={0}>
        <div
          data-name="Product Page"
          className={cn(
            'fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground',
            withSidebar && '[&_aside[data-name=sidebar-container]]:!w-24',
          )}
        >
          {withSidebar ? <ShellSidebar /> : null}
          <div
            data-shell-column=""
            className={cn(
              'flex h-full min-h-0 flex-1 flex-col',
              withSidebar && 'transition-[padding] duration-300 ease-in-out lg:pl-24',
            )}
          >
            <ShellHeader />
            <div id="shell-scroll" className="shell-scroll h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
              <SubNavFrameBody subNav={subNav} />
            </div>
          </div>
        </div>
        </TooltipProvider>
      </ShellProvider>
    </PathnameProvider>
  );
}

export const Skeleton: Story = {
  render: () => (
    <div className="min-h-[120px] bg-background">
      <StoryNote>
        Official Lumen skeleton — same as <code>Lumen/Utilities/Skeleton</code>.
        Chrome stays real. Casino only.
      </StoryNote>
      <CasinoLobbySkeleton />
    </div>
  ),
};

/** Just the bar — this is the shipped component, no page chrome. */
export const ComponentOnly: Story = {
  render: () => (
    <div className="min-h-[120px] bg-background">
      <StoryNote>
        The CasinoSubNav component itself. Same file the live site imports (`casino-sub-nav` → live-site `casino-subnav`).
        Default / Hidden Sidebar stories show it under the product shell.
      </StoryNote>
      <CasinoSubNav glass sticky motion />
    </div>
  ),
};

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>
        Scroll the page — sub-menu sticks under the 68px header. Use the Mode toolbar for light / dark (glass uses `--container`).
      </StoryNote>
      <SubNavFrame subNav={{ glass: true, sticky: true, motion: true }} />
    </div>
  ),
};

export const Dark: Story = {
  globals: { mode: 'dark' },
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>
        Dark sub-menu (Casino-Lumen 111:151968). Same as toolbar Mode → dark; this story pins dark on load.
      </StoryNote>
      <SubNavFrame mode="dark" subNav={{ glass: true, sticky: true, motion: true }} />
    </div>
  ),
};

export const LightAndDark: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>
        Light = Default story or toolbar Mode → light. Dark = Dark story (pinned) or toolbar Mode → dark. Testing
        ground: /prototype?preview=casino&amp;ground=1&amp;mode=dark (toolbar dark / lab checkbox).
      </StoryNote>
      <SubNavFrame mode="dark" subNav={{ glass: true, sticky: true, motion: true, defaultActive: 'Slots' }} />
    </div>
  ),
};

export const SolidBar: Story = {
  render: () => <SubNavFrame subNav={{ glass: false, sticky: true, motion: true }} />,
};

export const DarkSolidBar: Story = {
  globals: { mode: 'dark' },
  render: () => (
    <SubNavFrame
      mode="dark"
      subNav={{ glass: false, sticky: true, motion: true, defaultActive: 'Slots' }}
    />
  ),
};

export const NoSticky: Story = {
  render: () => <SubNavFrame subNav={{ glass: true, sticky: false, motion: true }} />,
};

export const ReducedMotion: Story = {
  render: () => <SubNavFrame subNav={{ glass: true, sticky: true, motion: false }} />,
};

export const HiddenSidebar: Story = {
  render: () => (
    <SubNavFrame withSidebar subNav={{ glass: true, sticky: true, motion: true }} />
  ),
};

export const FavouritesActive: Story = {
  render: () => (
    <SubNavFrame subNav={{ glass: true, sticky: true, motion: true, defaultFavourites: true }} />
  ),
};

export const ActiveSlots: Story = {
  render: () => (
    <SubNavFrame subNav={{ glass: true, sticky: true, motion: true, defaultActive: 'Slots' }} />
  ),
};

export const DarkActiveSlots: Story = {
  globals: { mode: 'dark' },
  render: () => (
    <SubNavFrame
      mode="dark"
      subNav={{ glass: true, sticky: true, motion: true, defaultActive: 'Slots' }}
    />
  ),
};
