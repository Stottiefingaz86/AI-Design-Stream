import { useRef } from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import {
  RewardCard,
  rewardCardIdleButtonAction,
  rewardCardLoadingButtonAction,
  rewardCardRakebackInfo,
} from '../reward-card';
import { StoryNote } from '../story-kit';

const containerDecorator: Decorator = (Story) => (
  <div className="flex min-h-40 items-center justify-center px-6">
    <div className="w-full max-w-md">
      <Story />
    </div>
  </div>
);

const meta = {
  title: 'Lumen/Casino/Reward Card',
  component: RewardCard,
  decorators: [containerDecorator],
  parameters: {
    docs: {
      description: {
        component:
          'One reward/promotion entry in the Loyalty Hub list. Copy arrives fully resolved through two grouped objects: rewardInfo (icon / title / subtitle, the info popover, infoLabel, optional termsLabel and onTermsClick) and buttonAction (disabled / loading / actionVariant / actionIcon / actionLabel / buttonLabel / buttonRef). Clicking the action button only calls onClick. RewardCard never renders Confetti itself — forward buttonRef and fire({ buttonRef.current }) from the orchestrator.',
      },
    },
  },
} satisfies Meta<typeof RewardCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    buttonAction: rewardCardIdleButtonAction,
  },
  decorators: [containerDecorator],
};

export const Loading: Story = {
  args: {
    buttonAction: rewardCardLoadingButtonAction,
  },
  decorators: [containerDecorator],
};

export const Playground: Story = {
  args: {
    disabled: false,
    loading: false,
    actionVariant: 'primary',
    actionLabel: 'Claim $0.99',
    buttonLabel: 'Claiming reward',
  } as never,
  argTypes: {
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    actionVariant: { control: 'select', options: ['primary', 'secondary', 'secondary-inverted'] },
    actionLabel: { control: 'text' },
    buttonLabel: { control: 'text' },
  },
  decorators: [containerDecorator],
  render: ({
    disabled,
    loading,
    actionVariant,
    actionLabel,
    buttonLabel,
    testId,
  }: {
    disabled?: boolean;
    loading?: boolean;
    actionVariant?: 'primary' | 'secondary' | 'secondary-inverted';
    actionLabel?: string;
    buttonLabel?: string;
    testId?: string;
  }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    return (
      <div className="flex flex-col gap-3">
        <StoryNote>
          Loyalty Hub row. Action only calls onClick. Pass buttonRef if you want Confetti to fire from this button — the card does not mount Confetti.
        </StoryNote>
        <RewardCard
          testId={testId}
          rewardInfo={rewardCardRakebackInfo}
          buttonAction={{
            disabled,
            loading,
            actionVariant,
            actionLabel: actionLabel ?? 'Claim $0.99',
            buttonLabel,
            buttonRef,
          }}
        />
      </div>
    );
  },
};
