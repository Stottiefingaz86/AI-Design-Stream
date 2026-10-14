import type { ReactNode } from 'react';

/** Side-by-side state matrix used across Lumen stories. Hover the Default column to see live hover. */
export function StateRow({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label ? <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p> : null}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function StateLabel({ children }: { children: ReactNode }) {
  return <span className="w-20 shrink-0 text-xs text-muted-foreground">{children}</span>;
}

export function StoryStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-8">{children}</div>;
}

export function StoryNote({ children }: { children: ReactNode }) {
  return <p className="max-w-xl text-sm text-muted-foreground">{children}</p>;
}
