import { colorize, fg, gradient, hexToRgb, paint, RESET, type Rgb } from '../ansi.ts';
import type { Theme } from '../theme/theme.ts';
import type { Segment } from './segment.ts';

const BAR_WIDTH = 8;
const BAR_CELL = '━';

/** 200000 → "200k", 1000000 → "1M", 1500000 → "1.5M". */
export function formatTokens(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n % 1e6 ? 1 : 0)}M`;
  return `${Math.round(n / 1e3)}k`;
}

/**
 * Eight-cell bar shaded green → yellow → red, then the percentage in the color
 * of the bar's leading edge, then the window size in dim text.
 */
export function renderContext(pct: number, windowSize: number | undefined, theme: Theme): string {
  const [low, mid, high] = theme.barGradient;
  const stops: readonly [Rgb, Rgb, Rgb] = [hexToRgb(low), hexToRgb(mid), hexToRgb(high)];
  const filled = Math.round((pct / 100) * BAR_WIDTH);
  let bar = '';
  for (let i = 0; i < BAR_WIDTH; i++) {
    const color = i < filled ? gradient(stops, i / (BAR_WIDTH - 1)) : fg(theme.barEmpty);
    bar += color + BAR_CELL;
  }
  const percent = paint(gradient(stops, Math.max(0, pct - 1) / 100), ` ${pct}%`);
  const total = windowSize ? colorize(theme.dim, ` /${formatTokens(windowSize)}`) : '';
  return bar + RESET + percent + total;
}

export const contextSegment: Segment = ({ input, theme }) => {
  const pct = Math.floor(input.context_window?.used_percentage ?? 0);
  return renderContext(pct, input.context_window?.context_window_size, theme);
};
