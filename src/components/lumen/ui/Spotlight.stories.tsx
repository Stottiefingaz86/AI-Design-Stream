import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spotlight } from '../animations';
const meta = { title: 'Lumen/Foundations/Animations/Spotlight', component: Spotlight } satisfies Meta<typeof Spotlight>;
export default meta;
export const Default: StoryObj = { render: () => <Spotlight><strong>Featured game</strong><p className="text-sm text-muted-foreground">Gates of Olympus</p></Spotlight> };
