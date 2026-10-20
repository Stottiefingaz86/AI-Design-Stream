import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CasinoLobbyBannerRow,
  DailyRacesBanner,
  PromoLobbyBanner,
  VipProgressBanner,
} from '@/components/lumen/casino-lobby-banners';
import { CasinoBannerSkeleton } from '@/components/lumen/casino-lobby-skeleton';
import { StoryNote } from '../story-kit';

const PROMO_ART =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 164"><rect width="132" height="164" fill="%23e9e7e7"/><circle cx="66" cy="72" r="28" fill="%23c3c3c3"/><path d="M48 96h36l-18 22z" fill="%23a5a5a5"/></svg>';

const meta = {
  title: 'Lumen/Casino/Lobby Banners',
  component: CasinoLobbyBannerRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CasinoLobbyBannerRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  render: () => (
    <div className="max-w-[1200px] bg-surface-muted-2 p-6">
      <StoryNote>
        Casino-Lumen 69-47911 — VIP Progress, Daily Races, promo cards (288 / 288 / 340). Official inside
        arrows overlay the track (rounded-full). Play Now is Button size="sm".
      </StoryNote>
      <CasinoLobbyBannerRow />
    </div>
  ),
};

export const VipProgress: StoryObj<typeof VipProgressBanner> = {
  render: () => (
    <div className="p-6">
      <VipProgressBanner />
    </div>
  ),
};

export const DailyRaces: StoryObj<typeof DailyRacesBanner> = {
  render: () => (
    <div className="p-6">
      <DailyRacesBanner />
    </div>
  ),
};

export const PromoBanner: StoryObj<typeof PromoLobbyBanner> = {
  render: () => (
    <div className="p-6">
      <PromoLobbyBanner />
    </div>
  ),
};

export const PromoWithArt: StoryObj<typeof PromoLobbyBanner> = {
  render: () => (
    <div className="p-6">
      <PromoLobbyBanner
        tag="Weekend"
        title="Free Spins"
        body="Grab 50 free spins on our top slots, this weekend only."
        buttonLabel="Claim now"
        imageSrc={PROMO_ART}
      />
    </div>
  ),
};

export const PromosOnly: Story = {
  render: () => (
    <div className="max-w-[720px] p-6">
      <CasinoLobbyBannerRow vip={false} dailyRaces={false} promos={[{ id: 'a' }, { id: 'b' }]} />
    </div>
  ),
};

export const VipAndRacesOnly: Story = {
  render: () => (
    <div className="max-w-[640px] p-6">
      <CasinoLobbyBannerRow promos={[]} />
    </div>
  ),
};

export const LoadingSkeleton: Story = {
  render: () => (
    <div className="max-w-[1200px] bg-surface-muted-2 p-6">
      <StoryNote>
        Matching skeleton — flat <code>--skeleton</code> blocks (288 / 288 / 340 / 340).
      </StoryNote>
      <CasinoBannerSkeleton />
    </div>
  ),
};
