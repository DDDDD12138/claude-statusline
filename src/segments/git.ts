import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { colorize } from '../ansi.ts';
import { resolveCwd } from './dir.ts';
import type { Segment } from './segment.ts';

const CACHE_TTL_MS = 5_000;

function runGit(cwd: string, args: readonly string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    timeout: 1_500,
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

/** Current branch name, or the short SHA when HEAD is detached. Empty outside a repo. */
export function currentBranch(cwd: string): string {
  try {
    try {
      return runGit(cwd, ['symbolic-ref', '--short', 'HEAD']);
    } catch {
      return runGit(cwd, ['rev-parse', '--short', 'HEAD']);
    }
  } catch {
    return '';
  }
}

/**
 * Branch lookup cached per session for a few seconds. The status line re-runs
 * after every assistant message; spawning git each time is the main cost.
 */
function cachedBranch(
  cwd: string,
  sessionId: string | undefined,
  theme: { branch: string },
): string {
  const cache = join(tmpdir(), `claude-sl-git-${sessionId ?? 'x'}.txt`);
  try {
    if (Date.now() - statSync(cache).mtimeMs < CACHE_TTL_MS) return readFileSync(cache, 'utf8');
  } catch {}
  const branch = currentBranch(cwd);
  const out = branch ? colorize(theme.branch, branch) : '';
  try {
    writeFileSync(cache, out);
  } catch {}
  return out;
}

export const gitSegment: Segment = ({ input, theme }) => {
  const out = cachedBranch(resolveCwd(input), input.session_id, theme);
  return out || null;
};
