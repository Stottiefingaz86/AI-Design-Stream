/** Shared human gate for studio, live site, and Storybook. Cookie is host-scoped (all localhost ports). */

export const ACCESS_COOKIE = 'lumen-access';

export function getProjectPass(): string {
  const fromEnv =
    typeof import.meta !== 'undefined'
      ? String((import.meta as { env?: Record<string, string> }).env?.PUBLIC_STUDIO_PASS ?? '')
      : '';
  return fromEnv || '1966';
}

export function isProjectAuthed(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((part) => part.trim() === `${ACCESS_COOKIE}=1`);
}

export function setProjectAuthed(ok: boolean) {
  if (typeof document === 'undefined') return;
  document.cookie = ok
    ? `${ACCESS_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    : `${ACCESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
