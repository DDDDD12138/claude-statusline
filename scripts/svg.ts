/**
 * Render fixtures through the built bundle and write docs/statusline.svg, a
 * faithful picture of the colored output for the README. Re-run after theme changes.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURES = ['session-start', 'active', 'near-limit'];
const FONT_PX = 15;
const CHAR_W = FONT_PX * 0.6;
const LINE_H = FONT_PX * 1.8;
const PAD = 16;
const BG = '#1a1b26';
const FG = '#c0caf5';

function render(fixture: string): string {
  const input = readFileSync(join(ROOT, 'test', 'fixtures', `${fixture}.json`), 'utf8');
  return execFileSync(process.execPath, [join(ROOT, 'dist', 'statusline.mjs')], {
    input,
    cwd: ROOT,
    encoding: 'utf8',
  }).trimEnd();
}

const ESC = '\u001b';
const SGR = new RegExp(`(${ESC}\\[[0-9;]*m)`);
const SGR_CODE = new RegExp(`^${ESC}\\[([0-9;]*)m$`);

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Turn one ANSI line into <tspan> runs. Only 24-bit foreground and reset are used. */
function spans(line: string): { svg: string; chars: number } {
  let color = FG;
  let svg = '';
  let chars = 0;
  for (const part of line.split(SGR)) {
    const sgr = SGR_CODE.exec(part);
    if (sgr) {
      const code = sgr[1] ?? '';
      if (code === '0') color = FG;
      else {
        const rgb = /^38;2;(\d+);(\d+);(\d+)$/.exec(code);
        if (rgb) color = `rgb(${rgb[1]},${rgb[2]},${rgb[3]})`;
      }
    } else if (part) {
      svg += `<tspan fill="${color}">${escapeXml(part)}</tspan>`;
      chars += [...part].length;
    }
  }
  return { svg, chars };
}

const lines = FIXTURES.map((f) => spans(render(f)));
const width = Math.ceil(Math.max(...lines.map((l) => l.chars)) * CHAR_W + PAD * 2);
const height = Math.ceil(lines.length * LINE_H + PAD * 2);
const text = lines
  .map((l, i) => `  <text x="${PAD}" y="${PAD + LINE_H * (i + 0.75)}">${l.svg}</text>`)
  .join('\n');

writeFileSync(
  join(ROOT, 'docs', 'statusline.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="'JetBrains Mono', 'Fira Code', Menlo, Consolas, monospace" font-size="${FONT_PX}" xml:space="preserve">
  <title>claude-statusline: model, directory, branch and context bar at three usage levels</title>
  <rect width="100%" height="100%" rx="8" fill="${BG}"/>
${text}
</svg>
`,
);
process.stdout.write(`docs/statusline.svg (${width}×${height})\n`);
