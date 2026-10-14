import type { AnchorHTMLAttributes, ReactNode } from 'react';

/** Storybook stand-in for next/link — same href, no router. */
export default function Link({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
