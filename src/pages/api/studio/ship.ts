import type { APIRoute } from 'astro';
import { shipToLiveSite } from '@/lib/studio/ship.server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { projectId?: string; title?: string; surface?: string; brief?: string; liveUrl?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400 });
  }
  if (!body.projectId) return new Response(JSON.stringify({ error: 'projectId required' }), { status: 400 });
  const liveUrl = body.liveUrl || 'http://localhost:3000';
  try {
    const snap = shipToLiveSite({
      projectId: body.projectId,
      title: body.title ?? '',
      surface: body.surface ?? '',
      brief: body.brief ?? '',
      liveUrl,
    });
    return new Response(JSON.stringify({ ok: true, liveUrl: snap.liveUrl, rollbackId: snap.projectId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Live ship failed.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
