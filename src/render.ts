import { colorize } from './ansi.ts';
import { reportError } from './debug.ts';
import type { Segment, SegmentContext } from './segments/segment.ts';

const SEPARATOR = ' · ';

/**
 * Run every segment and join the visible ones. A segment that throws is
 * skipped rather than taking the whole line down.
 */
export function renderLine(segments: readonly Segment[], ctx: SegmentContext): string {
  const parts: string[] = [];
  for (const segment of segments) {
    try {
      const out = segment(ctx);
      if (out) parts.push(out);
    } catch (err) {
      reportError(segment.name || 'segment', err);
    }
  }
  return parts.join(colorize(ctx.theme.separator, SEPARATOR));
}
