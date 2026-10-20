/**
 * Server-only: run a real Cursor agent against this repo.
 * Local runtime (not cloud) so Figma MCP login + the working tree stay on this machine.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Agent, CursorAgentError } from '@cursor/sdk';
import { AGENT_BY_ID } from './agents';
import { agentKnowledgeBrief, REFERENCE_FILES } from './knowledge';
import { tasteBrief, type TasteMemory } from './taste';
import { parseDiff, sanitizeAssistant } from './cursor-activity';
import type { CursorActivityLine, CursorRunMode, CursorStreamEvent, StudioAgentId } from './types';

function asObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}
function str(v: unknown) {
  return typeof v === 'string' && v.trim() ? v : undefined;
}
function num(v: unknown) {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
function resultValue(result: unknown): Record<string, unknown> | null {
  const r = asObj(result);
  if (!r) return null;
  if (r.status === 'success') return asObj(r.value) ?? r;
  return r;
}

const FIGMA_TOOL =
  /figma|get_design_context|get_screenshot|create_session|get_metadata|use_figma|create_new_file|search_design_system|get_libraries|get_variable_defs|get_code_connect|generate_diagram|generate_figma_design|get_figjam/i;

function toolBlob(event: { name: string; args?: unknown }) {
  const args = asObj(event.args);
  return [
    event.name,
    str(args?.toolName),
    str(args?.name),
    str(args?.providerIdentifier),
    str(args?.mcp_server_name),
    str(args?.server),
  ]
    .filter(Boolean)
    .join(' ');
}

function isFigmaMcpTool(event: { name: string; args?: unknown }) {
  return FIGMA_TOOL.test(toolBlob(event));
}

function parseFigmaUrl(url: string): { fileKey?: string; nodeId?: string } {
  const fileKey = url.match(/\/(?:design|file|board)\/([A-Za-z0-9]+)/)?.[1];
  const raw = url.match(/[?&]node-id=([^&]+)/i)?.[1];
  const nodeId = raw ? decodeURIComponent(raw).replace(/-/g, ':') : undefined;
  return { fileKey, nodeId };
}

function requiredFrame(input: CursorRunInput, urls: string[]) {
  const fromUrl = urls.map(parseFigmaUrl).find((x) => x.fileKey);
  if (fromUrl?.fileKey) return fromUrl;
  const blob = `${input.title} ${input.prompt}`;
  const pokerAsk =
    /\bpoker\b/i.test(blob.replace(/video[\s-]*poker/gi, ' ')) &&
    !/originals|casino|lobby|game carousel/i.test(blob);
  if (pokerAsk) return { fileKey: '6MRTcwJHXgYmLxBWxRLz4I', nodeId: '78:163252' };
  return { fileKey: 'omWPnweoGhy1Ulv1AXxx2z', nodeId: '69:47911' };
}

function hasRequiredFigma(mode: CursorRunInput['mode'], tools: Set<string>) {
  const names = [...tools].join(' ');
  if (mode === 'journey') return /generate_diagram|get_figjam/i.test(names);
  if (mode === 'mockup' || mode === 'ship') {
    return /create_new_file/i.test(names);
  }
  const read = /get_design_context|get_screenshot/i.test(names);
  const created = /create_new_file/i.test(names);
  return read && created;
}

function figmaGateFollowUp(input: CursorRunInput, urls: string[], tools: Set<string>) {
  const frame = requiredFrame(input, urls);
  const node = frame.nodeId ?? '(the selected frame)';
  const names = [...tools].join(' ');
  if (input.mode === 'journey') {
    return [
      'GATE FAILED. You never called generate_diagram. A chat sketch is not a journey.',
      'Call generate_diagram now (flowchart, not mermaid journey). planKey organization::1304356510223900444. Post the FigJam board URL.',
      `Job: “${input.title}”.`,
    ].join('\n');
  }
  if (input.mode === 'mockup' || input.mode === 'ship') {
    return [
      'GATE FAILED. You never created a Figma file. Invented UI is not a deliverable.',
      'Call create_new_file in the Lumen folder (projectId 625743109, fileName “Lumen studio — <job>”), then search_design_system + use_figma with Lumen_Desing System instances. Annotate happy path, error / empty / loading, and the flow. Do not write setup instructions. Do not finish. Do not post Casino-Lumen / Shell / the source URL as the Design mock.',
      `Job: “${input.title}”.`,
    ].join('\n');
  }
  const read = /get_design_context|get_screenshot/i.test(names);
  if (!read) {
    return [
      'GATE FAILED. You never called Figma MCP on the SOURCE. This job is invalid until you do. Invented pages are rejected.',
      'Figma tools are on this run. Call them now, in this order, before writing any more UI. Do not write setup instructions.',
      `1. create_session  fileKey=${frame.fileKey}  task: extract “${input.title}”`,
      `2. get_design_context  fileKey=${frame.fileKey}  nodeId=${node}`,
      `3. get_screenshot  fileKey=${frame.fileKey}  nodeId=${node}`,
      'If get_design_context is sparse, call it on the visible child nodes. Use Figma copy and assets only.',
      'Do not invent. Do not use PrototypeMock. Do not post a testing-ground link yet.',
      urls.length ? `Source Figma URL:\n${urls.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }
  return [
    'GATE FAILED. You read the source but never created the studio Design mock.',
    'The URL the human pasted (Casino-Lumen, 🐚 Shell, Poker_Landing, etc.) is SOURCE — not the Design mock tile.',
    `Call create_new_file now: fileName “Lumen studio — ${input.title}”, planKey organization::1304356510223900444, editorType design, projectId 625743109.`,
    'Then create_session on the NEW fileKey. search_design_system (Lumen_Desing System only) + use_figma.',
    'Frames to add, named with FRAME_NAMING:',
    '1. Happy path — the successful flow, annotated with how it behaves.',
    '2. Error / empty / loading — failure and waiting states, annotated.',
    '3. Flow — numbered steps or arrows for how the user moves through the feature.',
    'Sticky notes / text on every frame: behaviour, success, failure, what the user sees.',
    'Post ONLY the new https://www.figma.com/design/{newFileKey}/… URL. Do not post the source file.',
    `Job: “${input.title}”.`,
  ].join('\n');
}

function describeTool(event: {
  name: string;
  status: string;
  args?: unknown;
  result?: unknown;
}): Extract<CursorStreamEvent, { type: 'tool' }> {
  const args = asObj(event.args);
  const value = resultValue(event.result);
  const path = str(args?.path) ?? str(args?.file_path) ?? str(args?.target_file) ?? str(value?.path);
  const name = str(args?.toolName) ?? event.name;
  const figma = isFigmaMcpTool(event) || FIGMA_TOOL.test(name);
  let kind: 'read' | 'search' | 'edit' | 'other' = 'other';
  if (/grep|search|glob/i.test(name)) kind = 'search';
  else if (/edit|write|apply_patch|strreplace/i.test(name)) kind = 'edit';
  else if (figma || /read|screenshot|design_context|create_session|get_metadata/i.test(name)) kind = 'read';

  const file = path ?? (figma ? 'Figma' : undefined);
  let add = num(value?.linesAdded) ?? num(value?.linesCreated);
  const del = num(value?.linesRemoved);
  let lines: CursorActivityLine[] | undefined;
  const diff = str(value?.diffString);
  if (diff) {
    const parsed = parseDiff(diff, add);
    add = parsed.add;
    lines = parsed.lines;
  } else if (kind === 'edit' && str(args?.fileText)) {
    const text = str(args!.fileText)!;
    add = add ?? text.split('\n').length;
    lines = text.split('\n').slice(0, 5).map((t, i) => ({ n: i + 1, text: t.slice(0, 140), mark: '+' as const }));
  }

  return { type: 'tool', name, status: event.status, file, kind, add, del, lines };
}

function cursorApiKey() {
  const fromEnv = (process.env.CURSOR_API_KEY ?? '').trim();
  if (fromEnv) return fromEnv;
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    const line = raw.split('\n').find((l) => l.startsWith('CURSOR_API_KEY='));
    return line?.slice('CURSOR_API_KEY='.length).trim().replace(/^["']|["']$/g, '') ?? '';
  } catch {
    return '';
  }
}

export interface CursorRunInput {
  agentId: StudioAgentId;
  title: string;
  prompt: string;
  figmaUrls?: string[];
  images?: Array<{ mimeType: string; data: string }>;
  mode?: CursorRunMode;
}

function fileTasteBrief() {
  try {
    const mem = JSON.parse(readFileSync(resolve(process.cwd(), 'src/lib/studio/taste-memory.json'), 'utf8')) as TasteMemory;
    return tasteBrief(mem);
  } catch {
    return '';
  }
}

function systemPrompt(agentId: StudioAgentId, title: string, figmaUrls: string[], mode: CursorRunMode = 'implement') {
  const agent = AGENT_BY_ID[agentId];
  const casino = REFERENCE_FILES.find((f) => f.id === 'casino');
  const shell = REFERENCE_FILES.find((f) => f.id === 'shell');
  return [
    `You are ${agent.name}, ${agent.role} on the Lumen / BetOnline design studio.`,
    `Job: “${title}”.`,
    agent.blurb,
    '',
    agentKnowledgeBrief(),
    fileTasteBrief(),
    '',
    'Hard rules:',
    mode === 'journey'
      ? [
          '- This job is a FIGMA JOURNEY / FLOW, not a code implement and not a product mockup.',
          '- Deliverable is a FigJam board. Call generate_diagram (flowchart or stateDiagram). Mermaid `journey` is unsupported — model the path as a flowchart.',
          '- planKey organization::1304356510223900444. Name the board “Lumen journey — <job title>”.',
          '- Steps must be real Lumen surfaces (🐚 Shell, Casino lobby, Poker landing, UBC, account). Do not invent screens that are not in the product.',
          '- Post the board URL (figma.com/board/…). That is the deliverable. No testing-ground link.',
        ].join('\n')
      : mode === 'mockup'
      ? [
          '- This job is DESIGN IN FIGMA with the Lumen library — not a code implement, not a grabbed screenshot.',
          '- Create a NEW Figma Design file in the Lumen folder. Do not open or edit Casino-Lumen, 🐚 Shell, Studio-mocks, or any existing product file. Do not add pages to those files. The file the human pasted is SOURCE — never the Design mock.',
          '- create_new_file fileName “Lumen studio — <job title>”, planKey organization::1304356510223900444, editorType design, projectId 625743109. If projectId fails, still create the file (drafts is fine).',
          '- create_session on the new fileKey. get_libraries. search_design_system with includeLibraryKeys = Lumen_Desing System only (ignore Kraken, MUI, Sportsbook). Then assemble with use_figma: library instances + bound ☀️ Mode / 🚀 Themes variables. No raw hex, no detached boxes.',
          '- To see what is already in a product file, get_metadata with no nodeId (lists pages). Shell pages live on 🐚 Shell | Screens / Navbar / Sidebar / UBC / Footer.',
          '- Frames: Desktop 1440 + Mobile 375, light + dark when relevant. Name them “<Page>, <Auth> | <Device>, <Mode>”. Also add annotated frames for Happy path, Error / empty / loading, and Flow (numbered steps or arrows). Sticky notes on each frame: behaviour, success, failure, what the user sees.',
          '- When the frames are in, post https://www.figma.com/design/{newFileKey}/… — that is the Design mock. No testing-ground link until the human asks to build from that file.',
        ].join('\n')
      : mode === 'ship'
        ? [
            '- The human approved GO LIVE. The studio already wrote apps/live-site (casino → /casino, poker → /poker). Do not rewrite those routes. Do not say live is pending. Do not tell anyone to wait.',
            '- Your only job: create a NEW Figma Design file of what is now live, in the Lumen folder. Do not edit Casino-Lumen, 🐚 Shell, or Studio-mocks. Do not post those source URLs as the Design mock.',
            '- create_new_file fileName “Lumen studio — <job title>”, planKey organization::1304356510223900444, editorType design, projectId 625743109. Then create_session, search_design_system / get_libraries, use_figma for desktop 1440 + mobile 375 (light + dark when relevant). Annotate happy path, errors, empty/loading, and the flow.',
            '- Post the new Figma URL. Live is already up at http://localhost:3000/casino or /poker.',
          ].join('\n')
        : [
          '- FIGMA MCP IS A HARD GATE. Parse fileKey + node-id from the SOURCE the human pasted (or the default below). Call create_session, then get_design_context AND get_screenshot on that node BEFORE writing any UI. If the response is sparse, call get_design_context on the visible child nodes. Inventing a page is not a workaround.',
          '- Match the SOURCE Figma frame. List every visual miss against the Figma screenshot before you edit. Use Figma copy and assets. If Figma has lorem, keep lorem. Do not invent a different page.',
          '- DESIGN MOCK (mandatory, second deliverable): after the testing-ground build, create a NEW Figma Design file in the Lumen folder. The pasted / default file is SOURCE — never the Design mock tile. Never post Casino-Lumen, 🐚 Shell, Poker_Landing-Page, Studio-mocks, or Lumen_Desing System as the Design mock.',
          '- create_new_file fileName “Lumen studio — <job title>”, planKey organization::1304356510223900444, editorType design, projectId 625743109. Then create_session on the NEW fileKey, search_design_system (Lumen_Desing System only) + use_figma.',
          '- In that new file, add annotated frames: Happy path, Error / empty / loading, and Flow (numbered steps or arrows of how it works). Sticky notes / text on each frame: behaviour, success, failure, what the user sees. Product frames use “<Page>, <Auth> | <Device>, <Mode>”. Desktop 1440 + Mobile 375.',
          '- The runner watches the tool trace: get_design_context/get_screenshot AND create_new_file must both run or this job is rejected. Post ONLY the new https://www.figma.com/design/{newFileKey}/… URL as the Design mock.',
          '- Never use PrototypeMock / deriveMock invented hero–stats–schedule pages for a product job. That is leftover filler.',
          '- Chrome: live-site ShellHeader + ShellSidebar only. Poker = PokerProductShell + PokerLandingPage (src/components/lumen/poker-landing-page.tsx). Casino = CasinoProductShell. No invented BETONLINE wordmark header.',
          '- Do not invent UI. Do not reply with a prototype/testing-ground link until you have actually edited files.',
          '- Casino sub-nav lives in src/components/studio/mock/CasinoSubNav.tsx. That is the file to change for lobby pills / search / heart.',
          '- Every shipped UI includes a matching *Skeleton. Casino = CasinoLobbySkeleton (banner row only). Poker = PokerLandingSkeleton. Chrome stays real.',
          '- Build in the testing ground only: src/components/studio/mock/* . Live site stays locked until the human says go live / approve. Post /prototype?id=&ground=1 — never /component (that is a leftover button sheet).',
          `- Default SOURCE if no link: Casino-Lumen ${casino?.fileKey} node ${casino?.nodeId}. Poker_Landing-Page 6MRTcwJHXgYmLxBWxRLz4I node 78-163252. Shell ${shell?.fileKey} node ${shell?.nodeId}.`,
        ].join('\n'),
    '- Reuse Lumen / shadcn / live-site ShellHeader + ShellSidebar. No BETONLINE wordmark, no Tabler, no ToggleGroup rings.',
    figmaUrls.length
      ? `Figma links from the human:\n${figmaUrls.join('\n')}`
      : mode === 'journey'
        ? 'No existing FigJam URL — generate_diagram creates the board.'
        : mode === 'mockup' || mode === 'ship'
          ? 'No existing Figma URL — create a new file in the Lumen folder as above.'
          : 'No Figma URL in this message — use the default Casino-Lumen frame as SOURCE to read, then create a new Lumen studio file as the Design mock.',
    '- Figma tools are on this run via the Cursor Figma plugin (plugin-figma-figma). Call create_session, get_design_context, get_screenshot. Never say MCP is missing, unavailable, or not connected. Never tell the human to open Settings. If a Figma tool errors, retry that same call once, then stop in one sentence.',
    '- Do not edit astro.config.mjs, package.json, vite config, or the studio runner. Those restarts kill this job. Static assets go in public/ or apps/live-site/public.',
  ]
    .filter(Boolean)
    .join('\n');
}

type LiveRun = { stop: () => Promise<void> };
let live: LiveRun | null = null;

export async function abortLiveCursorRun() {
  if (!live) return;
  const prev = live;
  live = null;
  await prev.stop().catch(() => {
    /* already gone */
  });
}

export async function* runCursorAgent(input: CursorRunInput, signal?: AbortSignal): AsyncGenerator<CursorStreamEvent> {
  if (live) {
    const prev = live;
    live = null;
    await prev.stop().catch(() => {
      /* previous run may already be gone */
    });
  }
  const apiKey = cursorApiKey();
  if (!apiKey) {
    yield {
      type: 'error',
      text: 'CURSOR_API_KEY is missing. Add a user API key from https://cursor.com/dashboard/integrations to .env and restart the studio. Agents cannot run without it.',
    };
    return;
  }

  const figmaUrls = input.figmaUrls ?? [];
  const prompt = `${systemPrompt(input.agentId, input.title, figmaUrls, input.mode ?? 'implement')}\n\nHuman:\n${input.prompt}`;

  yield { type: 'status', text: `${AGENT_BY_ID[input.agentId].name} started a Cursor local run (Figma MCP + this repo).` };

  let agent: Awaited<ReturnType<typeof Agent.create>> | undefined;
  let run: Awaited<ReturnType<(typeof agent)['send']>> | undefined;
  let stopped = false;

  const stop = async () => {
    if (stopped) return;
    stopped = true;
    try {
      await run?.cancel();
    } catch {
      /* already finished */
    }
    try {
      const dispose = (agent as { [Symbol.asyncDispose]?: () => Promise<void> } | undefined)?.[Symbol.asyncDispose];
      if (dispose && agent) await dispose.call(agent);
    } catch {
      /* already disposed */
    }
  };

  live = { stop };
  const onAbort = () => {
    void stop();
  };
  signal?.addEventListener('abort', onAbort);

  try {
    if (signal?.aborted) return;
    // Plugins = Figma Cursor plugin. Project = this repo's rules/hooks.
    // Do NOT load user MCP (blender, roblox, apify…) — that drowns Figma.
    agent = await Agent.create({
      apiKey,
      model: { id: 'composer-2.5' },
      disallowedTools: ['task'],
      local: {
        cwd: process.cwd(),
        settingSources: ['project', 'plugins'],
      },
    });

    const figmaTools = new Set<string>();
    const consume = async function* (active: NonNullable<typeof run>) {
      for await (const event of active.stream()) {
        if (stopped || signal?.aborted) return;
        if (event.type === 'tool_call') {
          if (isFigmaMcpTool(event) && event.status !== 'error') {
            figmaTools.add(toolBlob(event));
          }
          yield describeTool(event);
        } else if (event.type === 'thinking') {
          yield { type: 'thinking', text: event.text, durationMs: event.thinking_duration_ms };
        } else if (event.type === 'assistant') {
          for (const block of event.message.content) {
            if (block.type === 'text' && block.text.trim()) {
              const text = sanitizeAssistant(block.text);
              if (text) yield { type: 'assistant', text };
            }
          }
        } else if (event.type === 'status') {
          yield { type: 'status', text: String(event.status) };
        }
      }
    };

    const mode = input.mode ?? 'implement';
    run = await agent.send({
      text: prompt,
      images: input.images?.length ? input.images : undefined,
    });
    yield* consume(run);
    if (stopped || signal?.aborted) return;

    let result = await run.wait();
    if (!hasRequiredFigma(mode, figmaTools)) {
      yield {
        type: 'status',
        text: 'Figma MCP was skipped. Sending the agent back — invented UI cannot finish this job.',
      };
      run = await agent.send({ text: figmaGateFollowUp(input, figmaUrls, figmaTools) });
      yield* consume(run);
      if (stopped || signal?.aborted) return;
      result = await run.wait();
    }

    if (!hasRequiredFigma(mode, figmaTools)) {
      const why =
        mode === 'journey'
          ? 'Job rejected: generate_diagram never ran. A chat sketch is not a journey. Retry — Mika has to post a FigJam board.'
          : mode === 'mockup' || mode === 'ship'
            ? 'Job rejected: never created a Figma file in the Lumen folder (need create_new_file). The source the human pasted is not the Design mock.'
            : 'Job rejected: need both a SOURCE read (get_design_context / get_screenshot) and a NEW Lumen-folder file (create_new_file) with annotated happy path / error / flow frames. Posting Casino-Lumen or the pasted mock is not the Design mock.';
      yield { type: 'error', text: why };
      return;
    }
    if (result.status === 'error') {
      yield { type: 'error', text: result.error?.message ?? 'Cursor run failed.' };
      return;
    }
    yield { type: 'done', text: result.result ?? 'Done. Refresh the testing ground.', ok: true };
  } catch (err) {
    if (stopped || signal?.aborted) return;
    if (err instanceof CursorAgentError) {
      yield { type: 'error', text: `Cursor did not start: ${err.message}` };
      return;
    }
    yield { type: 'error', text: err instanceof Error ? err.message : 'Cursor run crashed.' };
  } finally {
    signal?.removeEventListener('abort', onAbort);
    if (live?.stop === stop) live = null;
    await stop();
  }
}
