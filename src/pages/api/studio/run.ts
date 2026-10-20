import type { APIRoute } from 'astro';
import { runCursorAgent, type CursorRunInput } from '@/lib/studio/cursor-agent.server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: CursorRunInput;
  try {
    body = (await request.json()) as CursorRunInput;
  } catch {
    return new Response(JSON.stringify({ error: 'Bad JSON' }), { status: 400 });
  }
  if (!body?.prompt || !body.agentId) {
    return new Response(JSON.stringify({ error: 'prompt and agentId required' }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      let closed = false;
      const send = (event: unknown) => {
        if (closed) return;
        controller.enqueue(enc.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const ping = setInterval(() => send({ type: 'status', text: 'heartbeat' }), 12_000);
      try {
        for await (const event of runCursorAgent(body, request.signal)) {
          if (request.signal.aborted) break;
          send(event);
        }
      } catch (err) {
        send({ type: 'error', text: err instanceof Error ? err.message : 'run failed' });
      } finally {
        clearInterval(ping);
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
