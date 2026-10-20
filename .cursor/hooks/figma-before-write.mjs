import { figmaUsed, gatedUiPath, readHookInput, reply, sessionId } from './figma-gate.mjs';

try {
  const input = await readHookInput();
  if (!gatedUiPath(input) || figmaUsed(sessionId(input))) {
    reply({ permission: 'allow' });
    process.exit(0);
  }

  reply({
    permission: 'deny',
    agent_message:
      'FIGMA GATE: You may not write product UI until you call Figma MCP in this session — create_session, then get_design_context AND get_screenshot on the frame. Invented pages are rejected.',
    user_message: 'Blocked a UI write — Figma MCP was not used in this session.',
  });
} catch {
  reply({ permission: 'allow' });
}
