/**
 * Render every fixture in test/fixtures through the built bundle and print the
 * result. This is the only way the dev loop shows output: nothing is written to
 * ~/.claude unless you run the install script yourself.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BUNDLE = join(ROOT, 'dist', 'statusline.mjs');
const FIXTURES = join(ROOT, 'test', 'fixtures');

export function preview(): void {
  const files = readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.json'))
    .sort();
  const width = Math.max(...files.map((f) => basename(f, '.json').length));
  for (const file of files) {
    const input = readFileSync(join(FIXTURES, file), 'utf8');
    let line: string;
    try {
      line = execFileSync(process.execPath, [BUNDLE], {
        input,
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, STATUSLINE_DEBUG: '1' },
      }).trimEnd();
    } catch (err) {
      line = `\x1b[31merror:\x1b[0m ${err instanceof Error ? err.message : String(err)}`;
    }
    process.stdout.write(`\x1b[2m${basename(file, '.json').padEnd(width)}\x1b[0m  ${line}\n`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) preview();
