import { homedir } from 'node:os';
import { colorize } from '../ansi.ts';
import type { Segment } from './segment.ts';

const normalize = (p: string): string => p.replace(/\\/g, '/').replace(/\/+$/, '');

/**
 * Collapse the home directory to `~` and use forward slashes everywhere.
 * The path is never truncated. Comparison is case-insensitive on Windows.
 */
export function displayDir(path: string, home: string, caseInsensitive: boolean): string {
  const p = normalize(path);
  const h = normalize(home);
  const eq = (a: string, b: string): boolean =>
    caseInsensitive ? a.toLowerCase() === b.toLowerCase() : a === b;
  if (eq(p, h)) return '~';
  if (h && eq(p.slice(0, h.length), h) && p[h.length] === '/') return `~${p.slice(h.length)}`;
  return p;
}

/** The directory Claude Code is working in, falling back to the process cwd. */
export function resolveCwd(input: { workspace?: { current_dir?: string }; cwd?: string }): string {
  return input.workspace?.current_dir ?? input.cwd ?? process.cwd();
}

export const dirSegment: Segment = ({ input, theme }) =>
  colorize(theme.dir, displayDir(resolveCwd(input), homedir(), process.platform === 'win32'));
