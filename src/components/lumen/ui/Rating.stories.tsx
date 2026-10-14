import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from '@/components/ui/rating';
import { StateRow, StoryNote } from '../story-kit';

const meta = { title: 'Lumen/Data Display/Rating', component: Rating } satisfies Meta<typeof Rating>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>Hover stars to preview, click to set. From shadcn studio rating-01.</StoryNote>
      <Rating defaultValue={3} />
    </div>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <StateRow label="Interactive">
        <Rating defaultValue={4} />
      </StateRow>
      <StateRow label="Half stars">
        <Rating defaultValue={3.5} precision={0.5} />
      </StateRow>
      <StateRow label="Read only">
        <Rating defaultValue={4} readOnly />
      </StateRow>
      <StateRow label="Disabled">
        <Rating defaultValue={2} disabled />
      </StateRow>
      <StateRow label="Yellow">
        <Rating defaultValue={5} variant="yellow" />
      </StateRow>
    </div>
  ),
};
