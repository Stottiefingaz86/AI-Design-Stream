import { looksLikeFigmaTool, markFigmaUsed, readHookInput, reply, sessionId } from './figma-gate.mjs';

try {
  const input = await readHookInput();
  if (looksLikeFigmaTool(input)) markFigmaUsed(sessionId(input));
  reply({});
} catch {
  reply({});
}
