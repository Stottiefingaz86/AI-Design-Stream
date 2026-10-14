import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';

const meta = { title: 'Lumen/Navigation/Tab Menu', component: Tabs } satisfies Meta<typeof Tabs>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Tabs activationMode="automatic" defaultValue="overview" dir="ltr" shape="solid" variant="primary">
      <TabsList aria-label="Account sections" width="fit">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="rewards">Rewards</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Typography as="p" shape="small" variant="muted">
          Overview — Balance, bonuses and open bets.
        </Typography>
      </TabsContent>
      <TabsContent value="activity">
        <Typography as="p" shape="small" variant="muted">
          Activity — Every settled bet, newest first.
        </Typography>
      </TabsContent>
      <TabsContent value="rewards">
        <Typography as="p" shape="small" variant="muted">
          Rewards — Points, tiers and what they unlock.
        </Typography>
      </TabsContent>
      <TabsContent value="account">
        <Typography as="p" shape="small" variant="muted">
          Account — Limits, documents and preferences.
        </Typography>
      </TabsContent>
    </Tabs>
  ),
};
