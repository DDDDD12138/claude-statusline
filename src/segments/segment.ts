import type { Theme } from '../theme/theme.ts';
import type { StatusLineInput } from '../types.ts';

export interface SegmentContext {
  readonly input: StatusLineInput;
  readonly theme: Theme;
}

/**
 * A segment turns session state into one colored chunk of the status line.
 * Return null to hide the segment for this render.
 */
export type Segment = (ctx: SegmentContext) => string | null;
