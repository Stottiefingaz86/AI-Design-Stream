import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const FIGMA_TOOL =
  /figma|get_design_context|get_screenshot|create_session|get_metadata|use_figma|create_new_file|search_design_system|get_libraries|get_variable_defs|get_code_connect/i;

const UI_PATH =
  /src\/components\/studio\/mock|src\/components\/lumen|apps\/live-site\/components\/(lumen|site)|src\/lib\/lumen/;

export function readHookInput() {
  const raw = [];
  const stdin = process.stdin;
  stdin.setEncoding('utf8');
  return new Promise((resolve) => {
    stdin.on('data', (chunk) => raw.push(chunk));
    stdin.on('end', () => {
      const text = raw.join('').trim();
      if (!text) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch {
        resolve({});
      }
    });
  });
}

export function reply(payload) {
  process.stdout.write(JSON.stringify(payload));
}

export function sessionId(input) {
  return String(input.conversation_id || input.session_id || '').trim();
}

export function flagPath(id) {
  return join(tmpdir(), 'lumen-figma-mcp', id);
}

export function markFigmaUsed(id) {
  if (!id) return;
  mkdirSync(join(tmpdir(), 'lumen-figma-mcp'), { recursive: true });
  writeFileSync(flagPath(id), '1');
}

export function figmaUsed(id) {
  return Boolean(id && existsSync(flagPath(id)));
}

export function looksLikeFigmaTool(input) {
  const blob = [
    input.tool_name,
    input.mcp_server_name,
    input.mcp_server_url,
    typeof input.tool_input === 'string' ? input.tool_input : JSON.stringify(input.tool_input ?? ''),
  ]
    .filter(Boolean)
    .join(' ');
  return FIGMA_TOOL.test(blob);
}

export function gatedUiPath(input) {
  const args = typeof input.tool_input === 'string' ? safeJson(input.tool_input) : (input.tool_input ?? {});
  const path = String(args.path ?? args.file_path ?? args.target_file ?? args.file ?? '');
  return UI_PATH.test(path.replace(/\\/g, '/'));
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
