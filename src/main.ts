import { readFileSync } from 'node:fs';
import { reportError } from './debug.ts';
import { renderLine } from './render.ts';
import { segments } from './segments/index.ts';
import { tokyoNight } from './theme/tokyo-night.ts';
import type { StatusLineInput } from './types.ts';

function readInput(): StatusLineInput {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}') as StatusLineInput;
  } catch (err) {
    reportError('stdin', err);
    return {};
  }
}

try {
  const line = renderLine(segments, { input: readInput(), theme: tokyoNight });
  process.stdout.write(`${line}\n`);
} catch (err) {
  reportError('main', err);
}
