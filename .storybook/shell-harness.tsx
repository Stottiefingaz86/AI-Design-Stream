import { useEffect, type ReactNode } from 'react';
import { PathnameProvider } from './mocks/next-navigation';
import { ShellProvider, useShell } from '../apps/live-site/components/site/shell-context';

function OpenNav({ children }: { children: ReactNode }) {
  const { setNavOpen } = useShell();
  useEffect(() => {
    setNavOpen(true);
  }, [setNavOpen]);
  return children;
}

function ExpandSidebar({ children }: { children: ReactNode }) {
  const { expanded, toggle } = useShell();
  useEffect(() => {
    if (!expanded) toggle();
  }, [expanded, toggle]);
  return children;
}

/** Mobile frame — dock / sheets / drawer (375×667). */
export function ShellStory({
  pathname = '/casino',
  openNav = false,
  children,
}: {
  pathname?: string;
  openNav?: boolean;
  children: ReactNode;
}) {
  return (
    <PathnameProvider pathname={pathname}>
      <ShellProvider>
        <div data-shell-story="" className="relative h-[667px] w-[375px] overflow-hidden bg-background">
          {openNav ? <OpenNav>{children}</OpenNav> : children}
        </div>
      </ShellProvider>
    </PathnameProvider>
  );
}

/** Desktop frame — product sidebar + header (matches :3000 lg+). */
export function DesktopShellStory({
  pathname = '/casino',
  expanded = true,
  children,
}: {
  pathname?: string;
  expanded?: boolean;
  children: ReactNode;
}) {
  return (
    <PathnameProvider pathname={pathname}>
      <ShellProvider>
        <div
          data-shell-story-desktop=""
          className="relative h-[720px] w-full max-w-[1200px] overflow-hidden rounded-lg border border-border bg-background"
        >
          {expanded ? <ExpandSidebar>{children}</ExpandSidebar> : children}
        </div>
      </ShellProvider>
    </PathnameProvider>
  );
}
