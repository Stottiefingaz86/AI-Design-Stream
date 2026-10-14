import type { Meta, StoryObj } from '@storybook/react-vite';
import { SlidingIndicator } from '../animations';
const meta = { title: 'Lumen/Foundations/Animations/Sliding Tabs', component: SlidingIndicator } satisfies Meta<typeof SlidingIndicator>;
export default meta;
export const Default: StoryObj = { render: () => <SlidingIndicator items={['Cash', 'Sports', 'Casino']} /> };
export const Pills: StoryObj = { render: () => <SlidingIndicator variant="pills" items={['All', 'Live', 'Upcoming']} /> };
export const Underline: StoryObj = { render: () => <SlidingIndicator variant="underline" items={['NFL', 'NBA', 'MLB', 'NHL']} /> };
