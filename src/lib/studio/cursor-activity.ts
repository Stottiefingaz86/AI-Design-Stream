import type { CursorActivity, CursorActivityFile, CursorActivityLine, CursorStreamEvent } from './types';

export function emptyCursorActivity(): CursorActivity {
  return { summary: '', thinking: 'Thinking…', files: [], live: true };
}

function langOf(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'tsx' || ext === 'ts') return 'ts';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  if (ext === 'md') return 'md';
  return ext.slice(0, 4) || 'file';
}

function basename(path: string) {
  return path.split('/').pop() ?? path;
}

export function parseDiff(diff: string, add?: number): { add?: number; lines: CursorActivityLine[] } {
  const lines: CursorActivityLine[] = [];
  let n = 0;
  for (const raw of diff.split('\n')) {
    if (raw.startsWith('@@')) {
      const m = raw.match(/\+(\d+)/);
      if (m) n = Number(m[1]);
      continue;
    }
    if (raw.startsWith('+++') || raw.startsWith('---') || raw.startsWith('diff') || raw.startsWith('index')) continue;
    const mark = raw[0] === '+' ? '+' : raw[0] === '-' ? '-' : ' ';
    const text = raw.slice(1);
    if (mark !== ' ' || lines.length) lines.push({ n, text: text.slice(0, 140), mark });
    if (mark !== '-') n += 1;
    if (lines.length >= 6) break;
  }
  return { add: add ?? lines.filter((l) => l.mark === '+').length, lines };
}

function thinkLabel(durationMs?: number) {
  if (durationMs == null) return 'Thinking…';
  if (durationMs < 4000) return 'Thought briefly';
  return `Thought for ${Math.max(1, Math.round(durationMs / 1000))}s`;
}

/** Figma is already connected — never show Settings → MCP / headless-SDK howtos. */
const MCP_SETUP_DUMP =
  /plugin-figma-figma|headless\s+sdk|cursor settings\s*[→\-–].*mcp|settings\s*[→\-–]\s*mcp|figma plugin panel|not a headless|what you need to do\s*\(one time/i;

export function sanitizeAssistant(text: string) {
  if (MCP_SETUP_DUMP.test(text)) {
    const urls = text.match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)]+/gi) ?? [];
    return urls.join('\n');
  }
  return text
    .replace(/[^.!?\n]*\b(if you enable|once you enable|enable|turn on)\b[^.!?\n]*figma mcp[^.!?\n]*[.!?]?\s*/gi, '')
    .replace(/[^.!?\n]*figma mcp (is |isn'?t |was )?(not )?(enabled|connected|available)[^.!?\n]*[.!?]?\s*/gi, '')
    .replace(/[^.!?\n]*figma mcp isn'?t available[^.!?\n]*[.!?]?\s*/gi, '')
    .replace(/[^.!?\n]*after auth[^.!?\n]*[.!?]?\s*/gi, '')
    .trim();
}

export function applyCursorEvent(activity: CursorActivity, ev: CursorStreamEvent): CursorActivity {
  const next: CursorActivity = {
    ...activity,
    files: activity.files.map((f) => ({ ...f, lines: f.lines?.map((l) => ({ ...l })) })),
  };

  if (ev.type === 'thinking') {
    next.thinking = thinkLabel(ev.durationMs);
    return next;
  }

  if (ev.type === 'tool') {
    const reads = (next.summary.match(/Explored ([^,]+)/)?.[1] ?? '')
      .split(/,\s*/)
      .filter((x) => x && !/^\d+\s+file/.test(x) && x !== 'Figma');
    let searches = Number(next.summary.match(/(\d+)\s+search/)?.[1] ?? 0);

    if (ev.kind === 'search') searches += ev.status === 'completed' ? 1 : 0;
    if (ev.kind === 'read' && ev.file && ev.status === 'completed') {
      const name = basename(ev.file);
      if (!reads.includes(name)) reads.push(name);
    }
    if (ev.kind === 'edit' && ev.file) {
      const path = ev.file;
      const existing = next.files.find((f) => f.path === path);
      const card: CursorActivityFile = {
        path,
        lang: langOf(path),
        add: ev.add ?? existing?.add,
        del: ev.del ?? existing?.del,
        lines: ev.lines?.length ? ev.lines : existing?.lines,
      };
      next.files = existing
        ? next.files.map((f) => (f.path === path ? card : f))
        : [...next.files, card];
    }

    const explore =
      reads.length === 1
        ? `Explored ${reads[0]}`
        : reads.length > 1
          ? `Explored ${reads.slice(-1)[0]}`
          : ev.file && ev.kind === 'read'
            ? `Explored ${basename(ev.file)}`
            : next.summary.startsWith('Explored')
              ? next.summary.split(',')[0]
              : '';
    const searchBit = searches ? `${searches} search${searches === 1 ? '' : 'es'}` : '';
    next.summary = [explore, searchBit].filter(Boolean).join(', ');
    if (ev.status === 'running' && !next.thinking) next.thinking = 'Thinking…';
    return next;
  }

  if (ev.type === 'done') {
    next.live = false;
    next.retryable = false;
    next.error = undefined;
    if (next.thinking === 'Thinking…') next.thinking = 'Thought briefly';
  }

  if (ev.type === 'error') {
    next.live = false;
    next.retryable = isRetryableCursorError(ev.text);
    next.error = ev.text;
    if (next.thinking === 'Thinking…') next.thinking = 'Thought briefly';
  }

  return next;
}

export function isRetryableCursorError(text: string) {
  return /network error|failed to fetch|connection dropped|load failed|econnreset|socket|timeout|502|503|504|err_network/i.test(text);
}

export function originalAsk(prompt: string) {
  const marker = 'Original ask:';
  const i = prompt.lastIndexOf(marker);
  return i >= 0 ? prompt.slice(i + marker.length).trim() : prompt;
}

export function resumeCursorPrompt(prompt: string) {
  return [
    'Previous Cursor run dropped mid-flight (network). Continue from the files as they are now — do not start from a blank guess.',
    'Figma MCP is required. Call create_session + get_design_context + get_screenshot on the frame before writing UI. Skipping it fails the job. Do not invent. Do not claim MCP is missing. Do not write Settings → MCP setup instructions.',
    'Casino sub-nav: src/components/studio/mock/CasinoSubNav.tsx only. Live site stays locked.',
    'Ship a matching *Skeleton with every UI (CasinoLobbySkeleton — flat --skeleton banners + tiles). Empty slots while loading are a bug.',
    '',
    'Original ask:',
    originalAsk(prompt),
  ].join('\n');
}
