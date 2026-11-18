import type { Meta, StoryObj } from '@storybook/react-vite';
import { CasinoLobby } from '../../../apps/live-site/components/lumen/casino-lobby-page';
import { PromotionsLobbyPage } from '../../../apps/live-site/components/lumen/promotions-lobby-page';
import { ShellHeader } from '../../../apps/live-site/components/site/shell-header';
import { ShellSidebar } from '../../../apps/live-site/components/site/shell-sidebar';
import { DesktopShellStory } from '../../../.storybook/shell-harness';
import { StoryNote } from './story-kit';

/**
 * Start here. These stories import apps/live-site — same modules as localhost:3000.
 * Do not use Lumen/Navigation/* shadcn demos as product reference.
 */
const meta = {
  title: 'Lumen/★ Demo site',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj;

export const WhereToLook: Story = {
  render: () => (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8 text-sm text-foreground">
      <h1 className="text-lg font-semibold">Storybook ↔ demo (:3000)</h1>
      <p className="text-muted-foreground">
        Product chrome and casino/promotions pages come from{' '}
        <code className="text-foreground">apps/live-site</code>. Generic stories under{' '}
        <strong>Navigation</strong> / shadcn primitives are design-system atoms — not the BetOnline
        shell.
      </p>
      <ul className="list-inside list-disc space-y-2 text-muted-foreground">
        <li>
          <strong className="text-foreground">Shell</strong> — Product Sidebar, Side Nav, Cashier,
          Account Sheet, Mobile Dock, Top Tabs
        </li>
        <li>
          <strong className="text-foreground">Casino</strong> — Lobby, Sub Nav, Lobby Banners
          (live-site modules)
        </li>
        <li>
          <strong className="text-foreground">★ Demo site</strong> — full compositions below
        </li>
      </ul>
      <StoryNote>
        Brand / Mode toolbar = betonline + light/dark, same as the live site.
      </StoryNote>
    </div>
  ),
};

export const CasinoLobbyChrome: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <StoryNote>
        Header + sidebar + CasinoLobby — same components as{' '}
        <code>http://127.0.0.1:3000/casino</code>.
      </StoryNote>
      <DesktopShellStory pathname="/casino">
        <ShellSidebar />
        <div className="flex h-full min-h-0 flex-col lg:pl-24">
          <ShellHeader />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CasinoLobby />
          </div>
        </div>
      </DesktopShellStory>
    </div>
  ),
};

export const PromotionsLobbyChrome: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <StoryNote>
        Promotions lobby inside shell — same as{' '}
        <code>http://127.0.0.1:3000/promotions</code> (Races nav unlisted until Merge).
      </StoryNote>
      <DesktopShellStory pathname="/promotions">
        <ShellSidebar />
        <div className="flex h-full min-h-0 flex-col lg:pl-24">
          <ShellHeader />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <PromotionsLobbyPage />
          </div>
        </div>
      </DesktopShellStory>
    </div>
  ),
};
