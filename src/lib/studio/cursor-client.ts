import { beginCursorJob, finishCursorJob, type CursorJob } from './pipeline';
import type { CursorRunMode, CursorStreamEvent, StudioAgentId, StudioAttachment } from './types';

function dataUrlToImage(a: StudioAttachment): { mimeType: string; data: string } | null {
  const m = a.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return null;
  return { mimeType: m[1]!, data: m[2]! };
}

export async function streamCursorRun(
  input: {
    agentId: StudioAgentId;
    title: string;
    prompt: string;
    figmaUrls?: string[];
    attachments?: StudioAttachment[];
    mode?: CursorRunMode;
  },
  onEvent: (event: CursorStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  let terminal = false;
  const emit = (event: CursorStreamEvent) => {
    if (event.type === 'done' || event.type === 'error') terminal = true;
    onEvent(event);
  };
  try {
    const res = await fetch('/api/studio/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        agentId: input.agentId,
        title: input.title,
        prompt: input.prompt,
        figmaUrls: input.figmaUrls ?? [],
        images: (input.attachments ?? []).map(dataUrlToImage).filter(Boolean),
        mode: input.mode ?? 'implement',
      }),
    });
    if (!res.ok || !res.body) {
      const err = await res.text().catch(() => res.statusText);
      const clean = err.includes('<title>') ? err.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240) : err;
      emit({ type: 'error', text: clean || `Cursor API ${res.status}` });
      return;
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split('\n\n');
      buf = parts.pop() ?? '';
      for (const part of parts) {
        const line = part.split('\n').find((l) => l.startsWith('data: '));
        if (!line) continue;
        try {
          emit(JSON.parse(line.slice(6)) as CursorStreamEvent);
        } catch {
          /* ignore partial JSON */
        }
      }
    }
    if (!terminal && !signal?.aborted) emit({ type: 'error', text: 'Connection dropped mid-run.' });
  } catch (err) {
    if (signal?.aborted || (err instanceof DOMException && err.name === 'AbortError') || (err instanceof Error && err.name === 'AbortError')) {
      return;
    }
    const raw = err instanceof Error ? err.message : 'network error';
    emit({
      type: 'error',
      text: /fetch|network|load failed/i.test(raw) ? 'Connection dropped mid-run.' : raw,
    });
  }
}

/** Start a Cursor run from the testing ground (office chat does not have to be open). */
export function startStudioCursorRun(job: CursorJob, channelId: string) {
  beginCursorJob({
    agentId: job.agentId,
    projectId: job.projectId ?? '',
    title: job.title,
    channelId,
  });
  void streamCursorRun(job, (ev) => {
    if (ev.type === 'done') finishCursorJob(job.agentId, true, ev.text, job.mode);
    if (ev.type === 'error') finishCursorJob(job.agentId, false, ev.text, job.mode);
  });
}
