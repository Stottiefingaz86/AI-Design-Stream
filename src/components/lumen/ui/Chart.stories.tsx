import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const data = [
  { day: 'Mon', stake: 120, win: 80 },
  { day: 'Tue', stake: 180, win: 140 },
  { day: 'Wed', stake: 90, win: 40 },
  { day: 'Thu', stake: 220, win: 200 },
  { day: 'Fri', stake: 160, win: 110 },
  { day: 'Sat', stake: 300, win: 260 },
  { day: 'Sun', stake: 140, win: 90 },
];

const config = {
  stake: { label: 'Stake', color: 'var(--primary)' },
  win: { label: 'Win', color: 'var(--success)' },
} satisfies ChartConfig;

const meta = { title: 'Lumen/Data Display/Chart', component: ChartContainer } satisfies Meta<typeof ChartContainer>;
export default meta;

export const Bars: StoryObj = {
  render: () => (
    <ChartContainer config={config} className="h-64 w-full max-w-xl">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="stake" fill="var(--color-stake)" radius={4} />
        <Bar dataKey="win" fill="var(--color-win)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

export const LineTrend: StoryObj = {
  render: () => (
    <ChartContainer config={config} className="h-64 w-full max-w-xl">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line dataKey="stake" stroke="var(--color-stake)" strokeWidth={2} dot={false} />
        <Line dataKey="win" stroke="var(--color-win)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
};
