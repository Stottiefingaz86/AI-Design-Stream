import { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Confetti, type ConfettiHandle } from '../animations';

const meta = {
  title: 'Lumen/Foundations/Animations/Confetti',
  component: Confetti,
  args: { area: 'parent', duration: 2.5, palette: 'chart', particleCount: 80 },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Confetti>;
export default meta;
type Story = StoryObj<typeof meta>;

function Celebrate({
  area = 'parent',
  duration = 2.5,
  palette = 'chart',
  particleCount = 80,
}: {
  area?: 'parent' | 'viewport';
  duration?: number;
  palette?: 'chart' | 'brand';
  particleCount?: number;
}) {
  const confettiRef = useRef<ConfettiHandle>(null);
  return (
    <div className="relative min-h-[360px] min-w-[420px] overflow-hidden rounded-lg border border-border bg-card p-8">
      <Button onClick={() => confettiRef.current?.fire()}>Celebrate</Button>
      <Confetti ref={confettiRef} area={area} duration={duration} palette={palette} particleCount={particleCount} />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <Celebrate {...args} />,
};

export const Brand: Story = {
  args: { palette: 'brand' },
  render: (args) => <Celebrate {...args} />,
};

export const Viewport: Story = {
  args: { area: 'viewport', particleCount: 120 },
  render: (args) => <Celebrate {...args} />,
};
