import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from '@/components/ui/typography';

const meta = { title: 'Lumen/Others/Block Heading' } satisfies Meta;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-2">
      <Typography shape="h3" weight="semibold">
        Popular games
      </Typography>
      <Typography variant="muted" shape="small">
        Slots, live tables and originals — hover the heading block in Figma for the page-header pattern.
      </Typography>
    </div>
  ),
};
