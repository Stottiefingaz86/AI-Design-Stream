declare module 'next/navigation' {
  import type { ReactNode } from 'react';
  export function PathnameProvider(props: { pathname: string; children: ReactNode }): ReactNode;
  export function usePathname(): string;
  export function useRouter(): { push(): void; replace(): void; prefetch(): void; back(): void };
  export function useSearchParams(): URLSearchParams;
}

declare module 'next/link' {
  import type { AnchorHTMLAttributes, ReactNode } from 'react';
  export default function Link(
    props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode },
  ): ReactNode;
}

declare module 'next/image' {
  import type { ImgHTMLAttributes } from 'react';
  export default function Image(props: ImgHTMLAttributes<HTMLImageElement> & { src: string }): React.ReactNode;
}
