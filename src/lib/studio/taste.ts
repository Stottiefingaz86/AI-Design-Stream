import type { StudioProject } from './types';

export type TasteKind = 'like' | 'hate' | 'rule' | 'moment';

export interface TasteEntry {
  id: string;
  kind: TasteKind;
  text: string;
  why?: string;
  surface?: string;
  source: 'seed' | 'chat' | 'approval';
  createdAt: string;
}

export interface TasteMemory {
  version: 1;
  entries: TasteEntry[];
}

const STORAGE_KEY = 'design-studio:taste';

function emptyMemory(): TasteMemory {
  return { version: 1, entries: [] };
}

export function loadTasteLocal(): TasteMemory {
  if (typeof localStorage === 'undefined') return emptyMemory();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyMemory();
    const parsed = JSON.parse(raw) as TasteMemory;
    return { version: 1, entries: parsed.entries ?? [] };
  } catch {
    return emptyMemory();
  }
}

export function saveTasteLocal(mem: TasteMemory) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
}

export function mergeTaste(base: TasteMemory, extra: TasteMemory): TasteMemory {
  const seen = new Set(base.entries.map((e) => e.id));
  return {
    version: 1,
    entries: [...base.entries, ...extra.entries.filter((e) => !seen.has(e.id))],
  };
}

export function recordTaste(input: Omit<TasteEntry, 'id' | 'createdAt' | 'source'> & { source?: TasteEntry['source'] }): TasteEntry {
  const entry: TasteEntry = {
    ...input,
    id: `taste_${Math.random().toString(36).slice(2, 10)}`,
    source: input.source ?? 'chat',
    createdAt: new Date().toISOString(),
  };
  const mem = loadTasteLocal();
  mem.entries.push(entry);
  saveTasteLocal(mem);
  if (typeof fetch !== 'undefined') {
    void fetch('/api/studio/taste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {
      /* file write is best-effort — local cache still holds */
    });
  }
  return entry;
}

export function tasteBrief(mem?: TasteMemory): string {
  const entries = (mem ?? loadTasteLocal()).entries;
  if (!entries.length) return '';
  const line = (e: TasteEntry) => {
    const tag = e.kind === 'moment' ? 'when' : e.kind;
    return `- ${tag}: ${e.text}${e.why ? ` (${e.why})` : ''}`;
  };
  const likes = entries.filter((e) => e.kind === 'like' || e.kind === 'rule').slice(-8);
  const hates = entries.filter((e) => e.kind === 'hate').slice(-6);
  const moments = entries.filter((e) => e.kind === 'moment').slice(-6);
  return [
    'Chris’s taste (learned — follow this when there is no frame, and never contradict it when there is one):',
    ...likes.map(line),
    ...hates.map(line),
    moments.length ? 'Product moments (propose these when they earn it — don’t spray):' : '',
    ...moments.map(line),
  ]
    .filter(Boolean)
    .join('\n');
}

export function detectTasteAsk(text: string): { kind: 'like' | 'hate'; text: string } | null {
  const t = text.trim();
  const like = t.match(/^(?:i\s+(?:really\s+)?(?:like|love)|keep this|this is (?:it|right|good)|yes this)\b[:\s—-]*(.+)$/i);
  if (like?.[1]) return { kind: 'like', text: like[1].trim() };
  const hate = t.match(/^(?:i\s+(?:really\s+)?(?:hate|dislike)|never|don't|stop using|not this|this is (?:wrong|off|shit))\b[:\s—-]*(.+)$/i);
  if (hate?.[1]) return { kind: 'hate', text: hate[1].trim() };
  return null;
}

/** One product-moment suggestion for a new ask that has no Figma. */
export function suggestMoment(text: string, project?: StudioProject | null, mem?: TasteMemory): string | null {
  const moments = (mem ?? loadTasteLocal()).entries.filter((e) => e.kind === 'moment');
  if (!moments.length) return null;
  const q = `${text} ${project?.title ?? ''} ${project?.surface ?? ''}`.toLowerCase();
  const hit =
    moments.find((e) => e.surface && new RegExp(e.surface, 'i').test(q)) ??
    (/win|deposit|vip|level|congrat/i.test(q)
      ? moments.find((e) => /win|deposit|vip|level/i.test(e.text))
      : /error|fail|wrong/i.test(q)
        ? moments.find((e) => /error|fail/i.test(e.text))
        : null);
  const pick = hit ?? moments[0];
  return pick ? `If we’re inventing the moment (no frame): ${pick.text}` : null;
}
