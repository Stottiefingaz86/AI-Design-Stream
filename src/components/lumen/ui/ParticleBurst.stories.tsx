import type { Meta, StoryObj } from '@storybook/react-vite';
import { ParticleBurst } from '../animations';
const meta = { title: 'Lumen/Foundations/Animations/Particle Burst', component: ParticleBurst } satisfies Meta<typeof ParticleBurst>;
export default meta;
export const Default: StoryObj = { render: () => <ParticleBurst /> };
