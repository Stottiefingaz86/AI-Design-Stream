import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { TooltipProvider } from '../src/components/ui/tooltip';
import { StorybookPassGate } from './PassGate';
import '../src/styles/lumen.css';
import './shell-chrome.css';

/** Brand + mode toolbar → `<html data-brand>` / `.dark`, exactly how the live site switches theme. */
const withLumenTheme: Decorator = (Story, ctx) => {
  const brand = (ctx.globals.brand as string) || 'betonline';
  const mode = (ctx.globals.mode as string) || 'light';
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.brand = brand;
    html.classList.toggle('dark', mode === 'dark');
    document.body.style.background = 'var(--background)';
    document.body.style.color = 'var(--foreground)';
  }, [brand, mode]);
  return (
    <StorybookPassGate>
      <TooltipProvider delayDuration={0}>
        <div className="font-sans text-foreground">
          <Story />
        </div>
      </TooltipProvider>
    </StorybookPassGate>
  );
};

const preview: Preview = {
  decorators: [withLumenTheme],
  globalTypes: {
    brand: {
      description: 'Lumen brand (data-brand)',
      toolbar: { title: 'Brand', icon: 'paintbrush', items: ['betonline', 'default'], dynamicTitle: true },
    },
    mode: {
      description: 'Light / dark',
      toolbar: { title: 'Mode', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { brand: 'betonline', mode: 'light' },
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
  },
};

export default preview;
