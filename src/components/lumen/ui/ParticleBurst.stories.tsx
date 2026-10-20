import type { Meta, StoryObj } from '@storybook/react-vite';
import { ParticleBurst } from '../animations';

const meta = { title: 'Lumen/Foundations/Animations/Particle Burst', component: ParticleBurst } satisfies Meta<typeof ParticleBurst>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="relative grid h-56 w-full place-items-center overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <ParticleBurst>
        <span className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Jackpot!</span>
      </ParticleBurst>
    </div>
  ),
};
