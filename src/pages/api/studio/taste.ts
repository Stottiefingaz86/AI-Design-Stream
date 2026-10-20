import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { APIRoute } from 'astro';
import type { TasteEntry, TasteMemory } from '@/lib/studio/taste';

export const prerender = false;

const FILE = resolve(process.cwd(), 'src/lib/studio/taste-memory.json');

function readMem(): TasteMemory {
  try {
    return JSON.parse(readFileSync(FILE, 'utf8')) as TasteMemory;
  } catch {
    return { version: 1, entries: [] };
  }
}

function writeMem(mem: TasteMemory) {
  writeFileSync(FILE, `${JSON.stringify(mem, null, 2)}\n`, 'utf8');
}

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(readMem()), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let entry: TasteEntry;
  try {
    entry = (await request.json()) as TasteEntry;
  } catch {
    return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400 });
  }
  if (!entry?.text || !entry.kind) {
    return new Response(JSON.stringify({ error: 'kind and text required' }), { status: 400 });
  }
  const mem = readMem();
  if (!mem.entries.some((e) => e.id === entry.id || e.text === entry.text)) {
    mem.entries.push({
      id: entry.id || `taste_${Date.now().toString(36)}`,
      kind: entry.kind,
      text: entry.text.trim(),
      why: entry.why,
      surface: entry.surface,
      source: entry.source ?? 'chat',
      createdAt: entry.createdAt || new Date().toISOString(),
    });
    writeMem(mem);
  }
  return new Response(JSON.stringify(mem), { headers: { 'Content-Type': 'application/json' } });
};
