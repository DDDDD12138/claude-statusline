/**
 * The status line must never crash: a non-zero exit or an exception leaves the
 * line blank. Errors are swallowed unless STATUSLINE_DEBUG is set, in which case
 * they go to stderr where `claude --debug` surfaces them.
 */
export const DEBUG = Boolean(process.env['STATUSLINE_DEBUG']);

export function reportError(scope: string, err: unknown): void {
  if (!DEBUG) return;
  const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
  process.stderr.write(`[statusline] ${scope}: ${message}\n`);
}
