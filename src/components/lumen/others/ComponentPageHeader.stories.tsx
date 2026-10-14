import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';

const meta = { title: 'Lumen/Others/Component Page Header' } satisfies Meta;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <header className="flex max-w-2xl flex-col gap-3 border-b border-border pb-6">
      <div className="flex items-center gap-2">
        <Typography shape="h2" weight="bold">
          Button
        </Typography>
        <Badge variant="secondary">Actions</Badge>
      </div>
      <Typography variant="muted">
        Trigger an action. Hover, focus, active and disabled states live on the Button page.
      </Typography>
    </header>
  ),
};
