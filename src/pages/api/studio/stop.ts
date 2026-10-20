import type { APIRoute } from 'astro';
import { abortLiveCursorRun } from '@/lib/studio/cursor-agent.server';

export const prerender = false;

export const POST: APIRoute = async () => {
  await abortLiveCursorRun();
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
