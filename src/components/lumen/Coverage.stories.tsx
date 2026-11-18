import type { Meta, StoryObj } from '@storybook/react-vite';

/** Product truth first — then Lumen atoms. */
const PAGES = [
  [
    '★ Demo site (live-site modules)',
    [
      'Where To Look',
      'Casino Lobby Chrome',
      'Promotions Lobby Chrome',
      'Shell / Product Sidebar',
      'Shell / Side Nav',
      'Shell / Cashier Sheet',
      'Shell / Account Sheet',
      'Shell / Mobile Dock',
      'Casino / Lobby',
      'Casino / Sub Nav',
      'Casino / Lobby Banners',
    ],
  ],
  ['Foundations', ['Typography', 'Colors', 'Logos', 'Screens', 'Icons', 'Favicons', 'Shadows']],
  ['Actions', ['Button', 'Item', 'Icon Button']],
  ['Utilities', ['Backdrop', 'Scroll Area', 'Separator', 'Spinner', 'Skeleton']],
  [
    'Inputs',
    [
      'Radio',
      'Combobox',
      'Text Input',
      'File Input',
      'Checkbox',
      'OTP Input',
      'Date Picker',
      'Text Area',
      'Number Input',
      'Select',
      'Search Box',
      'Slider',
      'Switch',
      'Toggle',
      'Toggle Group',
      'Field',
    ],
  ],
  [
    'System States',
    [
      'Alert',
      'Sonner',
      'Alert Dialog',
      'Calendar',
      'Dialog',
      'Tooltip',
      'Progress',
      'Popover',
      'Hover Card',
    ],
  ],
  [
    'Data Display',
    [
      'Accordion',
      'Avatar',
      'Badge',
      'Dot Badge',
      'Drawer',
      'Sheet',
      'Card',
      'Carousel',
      'Chart',
      'Collapsible',
      'Form',
      'Form Wizard',
      'Pagination',
      'Rating',
      'Stepper',
      'Table',
      'Context Menu',
      'Timeline',
    ],
  ],
  [
    'Navigation (atoms — not BetOnline shell)',
    ['Breadcrumbs', 'Command', 'Dropdown Menu', 'Menu Bar', 'Nav Menu', 'Tab Menu'],
  ],
  ['Others', ['Block Heading', 'Component Page Header', 'Misc']],
] as const;

const meta = { title: 'Lumen/Coverage' } satisfies Meta;
export default meta;

export const FigmaPages: StoryObj = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Demo site chrome</strong> lives under{' '}
        <code>Lumen/★ Demo site</code> and <code>Lumen/Shell/*</code> — imported from{' '}
        <code>apps/live-site</code>. Navigation atoms (old Sidebar demo removed) are primitives
        only.
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
