export interface StatusLineSetting {
  type: 'command';
  command: string;
  padding?: number;
}

export const STATUS_LINE: StatusLineSetting = {
  type: 'command',
  command: 'node ~/.claude/statusline.mjs',
  padding: 0,
};

export interface MergeResult {
  /** Full file text to write. */
  text: string;
  /** False when `statusLine` already had exactly this value. */
  changed: boolean;
}

/**
 * Set `statusLine` in a settings.json document and leave everything else as it
 * was: other keys, key order and indentation. `current` is the existing file
 * text, or undefined when the file does not exist yet.
 */
export function mergeSettings(
  current: string | undefined,
  statusLine: StatusLineSetting,
): MergeResult {
  const settings = parseSettings(current);
  const changed = JSON.stringify(settings['statusLine']) !== JSON.stringify(statusLine);
  const next = { ...settings, statusLine };
  return { text: `${JSON.stringify(next, null, detectIndent(current))}\n`, changed };
}

function parseSettings(text: string | undefined): Record<string, unknown> {
  if (text === undefined || text.trim() === '') return {};
  const value: unknown = JSON.parse(text);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('settings.json must contain a JSON object');
  }
  return value as Record<string, unknown>;
}

function detectIndent(text: string | undefined): string | number {
  const match = text ? /^(\t+| +)"/m.exec(text) : null;
  if (!match?.[1]) return 2;
  return match[1].startsWith('\t') ? '\t' : match[1].length;
}
