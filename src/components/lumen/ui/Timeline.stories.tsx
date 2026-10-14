import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Timeline,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineTitle,
} from '@/components/ui/timeline';

const meta = { title: 'Lumen/Data Display/Timeline', component: Timeline } satisfies Meta<typeof Timeline>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Timeline className="max-w-sm">
      <TimelineItem>
        <TimelineIndicator />
        <TimelineContent>
          <TimelineTitle>Bet placed</TimelineTitle>
          <TimelineDescription>Lakers ML · $25 · 2 minutes ago</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineIndicator />
        <TimelineContent>
          <TimelineTitle>Accepted</TimelineTitle>
          <TimelineDescription>Odds locked at -110</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineIndicator className="bg-success" />
        <TimelineContent>
          <TimelineTitle>Settled — won</TimelineTitle>
          <TimelineDescription>Payout $47.73</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};
