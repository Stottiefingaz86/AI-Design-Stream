'use client';

import { CasinoProductShell } from './CasinoProductShell';

/** Casino-Lumen Product Page — same live-site header as Figma. No invented chrome. */
export function CasinoDesignMock({ title }: { title: string }) {
  return <CasinoProductShell title={title} />;
}
