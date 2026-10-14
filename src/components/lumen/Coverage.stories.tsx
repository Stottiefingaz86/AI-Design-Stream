import type { Meta, StoryObj } from '@storybook/react-vite';

const PAGES = [
  ['Foundations', ['Typography', 'Colors', 'Logos', 'Screens', 'Icons', 'Favicons', 'Shadows', 'Animations']],
  ['Actions', ['Button', 'Item', 'Icon Button']],
  ['Utilities', ['Backdrop', 'Scroll Area', 'Separator', 'Spinner', 'Skeleton']],
  ['Inputs', ['Radio', 'Combobox', 'Text Input', 'File Input', 'Checkbox', 'OTP Input', 'Date Picker', 'Text Area', 'Number Input', 'Select', 'Search Box', 'Slider', 'Switch', 'Toggle', 'Toggle Group', 'Field']],
  ['System States', ['Alert', 'Sonner', 'Alert Dialog', 'Calendar', 'Dialog', 'Tooltip', 'Progress', 'Popover', 'Hover Card']],
  ['Data Display', ['Accordion', 'Avatar', 'Badge', 'Dot Badge', 'Drawer', 'Sheet', 'Card', 'Carousel', 'Chart', 'Collapsible', 'Form', 'Form Wizard', 'Pagination', 'Rating', 'Stepper', 'Table', 'Context Menu', 'Timeline']],
  ['Navigation', ['Breadcrumbs', 'Command', 'Dropdown Menu', 'Menu Bar', 'Nav Menu', 'Sidebar', 'Tab Menu']],
  ['Shell', ['Mobile Dock', 'Side Nav', 'Account Sheet', 'Mobile Top Tabs']],
  ['Others', ['Block Heading', 'Component Page Header', 'Misc']],
] as const;

const meta = { title: 'Lumen/Coverage' } satisfies Meta;
export default meta;

export const FigmaPages: StoryObj = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Every Lumen Figma page mapped into Storybook. UI primitives come from shadcn/studio. Shell stories import the live-site chrome (`apps/live-site/components/site/shell-*.tsx`) — there is no second dock, drawer or UBC. Use the Brand / Mode toolbar.
      </p>
      {PAGES.map(([group, items]) => (
        <div key={group}>
          <h3 className="mb-2 text-sm font-semibold">{group}</h3>
          <ul className="flex flex-wrap gap-2">
            {items.map((item) => (
              <li key={item} className="rounded-md border border-border bg-card px-2 py-1 text-xs">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  ),
};
