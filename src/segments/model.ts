import { colorize } from '../ansi.ts';
import type { Segment } from './segment.ts';

/** Model display name followed by the reasoning effort level, if any. */
export const modelSegment: Segment = ({ input, theme }) => {
  const name = colorize(theme.model, input.model?.display_name ?? '?');
  const level = input.effort?.level;
  const effort = level ? colorize(theme.effort, ` ${level}`) : '';
  return name + effort;
};
