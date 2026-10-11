import { contextSegment } from './context.ts';
import { dirSegment } from './dir.ts';
import { gitSegment } from './git.ts';
import { modelSegment } from './model.ts';
import type { Segment } from './segment.ts';

/** Display order, left to right. */
export const segments: readonly Segment[] = [modelSegment, dirSegment, gitSegment, contextSegment];
