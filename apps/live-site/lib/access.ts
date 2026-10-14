/** Same human gate as the studio. Cookie is host-scoped (all localhost ports). */

export const ACCESS_COOKIE = 'lumen-access';

export function getProjectPass(): string {
  return process.env.NEXT_PUBLIC_STUDIO_PASS || '1966';
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
