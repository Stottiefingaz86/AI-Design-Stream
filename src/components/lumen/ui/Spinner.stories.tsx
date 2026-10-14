import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '../feedback';
const meta = { title: 'Lumen/Utilities/Spinner', component: Spinner } satisfies Meta<typeof Spinner>;
export default meta;
export const Default: StoryObj = {
  render: () => <div className="flex items-center gap-6"><Spinner size="sm" /><Spinner /><Spinner size="lg" /></div>,
};
