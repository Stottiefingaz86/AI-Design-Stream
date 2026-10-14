import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from '../forms';
const meta = { title: 'Lumen/Inputs/Radio', component: Radio } satisfies Meta<typeof Radio>;
export default meta;
export const Default: StoryObj = { render: () => (<Radio name="odds" value="decimal" options={[{ value: "decimal", label: "Decimal (1.90)" }, { value: "american", label: "American (-110)" }]} />) };
