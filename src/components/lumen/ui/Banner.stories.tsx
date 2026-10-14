import type { Meta, StoryObj } from '@storybook/react-vite';
import { BannerCard } from '../data';

const BANNER_ART =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 164"><defs><linearGradient id="bg" x1="0" y1="0" x2="340" y2="164" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="%234338ca"/><stop offset="1" stop-color="%236d28d9"/></linearGradient></defs><rect width="340" height="164" fill="url(%23bg)"/><circle cx="270" cy="82" r="60" fill="%23fafafa" fill-opacity="0.18"/><circle cx="40" cy="28" r="22" fill="%23fafafa" fill-opacity="0.15"/><circle cx="312" cy="142" r="34" fill="%23fafafa" fill-opacity="0.12"/><circle cx="185" cy="18" r="10" fill="%23fafafa" fill-opacity="0.25"/><circle cx="95" cy="122" r="18" fill="%23fafafa" fill-opacity="0.1"/><circle cx="248" cy="34" r="7" fill="%23fafafa" fill-opacity="0.3"/><circle cx="18" cy="98" r="9" fill="%23fafafa" fill-opacity="0.2"/><circle cx="140" cy="60" r="5" fill="%23fafafa" fill-opacity="0.3"/><circle cx="300" cy="20" r="4" fill="%23fafafa" fill-opacity="0.35"/></svg>';

const meta = { title: 'Lumen/Casino/Banner', component: BannerCard } satisfies Meta<typeof BannerCard>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <BannerCard
      backgroundColor="#4338ca"
      buttonLabel="Claim now"
      description="Grab 50 free spins on our top slots, this weekend only."
      imageSrc={BANNER_ART}
      tag="New"
      textColor="light"
      title="Weekend Free Spins"
    />
  ),
};
