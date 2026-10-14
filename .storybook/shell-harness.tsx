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

/** Wraps live-site chrome so Storybook can set the product path and open the drawer. */
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
