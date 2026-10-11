import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SegmentContext } from '../src/segments/segment.ts';
import { tokyoNight } from '../src/theme/tokyo-night.ts';
import type { StatusLineInput } from '../src/types.ts';

/** Remove ANSI SGR sequences so assertions can read the text. */
// biome-ignore lint/suspicious/noControlCharactersInRegex: ESC is exactly what we match
export const stripAnsi = (s: string): string => s.replace(/\x1b\[[0-9;]*m/g, '');

export const ctx = (input: StatusLineInput): SegmentContext => ({ input, theme: tokyoNight });

/** Fresh temp directory; call the returned cleanup in `after`. */
export function tempDir(prefix = 'claude-sl-test-'): { path: string; cleanup: () => void } {
  const path = mkdtempSync(join(tmpdir(), prefix));
  return { path, cleanup: () => rmSync(path, { recursive: true, force: true }) };
}

/** Temp git repo on branch `main` with one empty commit. */
export function tempRepo(): { path: string; cleanup: () => void } {
  const dir = tempDir('claude-sl-repo-');
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: dir.path, stdio: 'ignore', env: gitEnv() });
  git('init', '-q', '-b', 'main');
  git('commit', '-q', '--allow-empty', '-m', 'init');
  return dir;
}

/** Deterministic identity so commits work on a machine without git config. */
export function gitEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    GIT_AUTHOR_NAME: 'test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
  };
}
