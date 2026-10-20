import type { APIRoute } from 'astro';
import { rollbackLiveSite } from '@/lib/studio/ship.server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { projectId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400 });
  }
  if (!body.projectId) return new Response(JSON.stringify({ error: 'projectId required' }), { status: 400 });
  const snap = rollbackLiveSite(body.projectId);
  if (!snap) return new Response(JSON.stringify({ error: 'No rollback snapshot for this job.' }), { status: 404 });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
