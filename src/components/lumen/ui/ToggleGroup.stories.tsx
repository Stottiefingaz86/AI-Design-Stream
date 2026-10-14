import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToggleGroup } from '../forms';
const meta = { title: 'Lumen/Inputs/Toggle Group', component: ToggleGroup } satisfies Meta<typeof ToggleGroup>;
export default meta;
export const Default: StoryObj = { render: () => (<ToggleGroup value="single" items={[{ value: "single", label: "Single" }, { value: "parlay", label: "Parlay" }, { value: "teaser", label: "Teaser" }]} />) };
