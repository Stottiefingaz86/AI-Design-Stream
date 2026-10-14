import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Typography } from '@/components/ui/typography';

const meta = { title: 'Lumen/Data Display/Accordion', component: Accordion } satisfies Meta<typeof Accordion>;
export default meta;

const BODY =
  'Every section is a disclosure: the trigger toggles it, and the panel below is exposed to assistive technology as a labelled region.';

export const Default: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg">
      <Accordion collapsible defaultValue="item-1" type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger headingLevel="h3" icon="info">
            What payment methods do you accept?
          </AccordionTrigger>
          <AccordionContent>
            <Typography shape="small" variant="muted" weight="normal">
              {BODY}
            </Typography>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger headingLevel="h3" icon="info">
            How long do withdrawals take?
          </AccordionTrigger>
          <AccordionContent>
            <Typography shape="small" variant="muted" weight="normal">
              {BODY}
            </Typography>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger headingLevel="h3" icon="info">
            Is my account protected?
          </AccordionTrigger>
          <AccordionContent>
            <Typography shape="small" variant="muted" weight="normal">
              {BODY}
            </Typography>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
