/** Minimal 24-bit ANSI helpers. No dependency on the terminal's palette. */

export const RESET = '\x1b[0m';

export type Rgb = readonly [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

export function fgRgb([r, g, b]: Rgb): string {
  return `\x1b[38;2;${r};${g};${b}m`;
}

export function fg(hex: string): string {
  return fgRgb(hexToRgb(hex));
}

/** Wrap text in a color escape and reset afterwards. */
export function paint(color: string, text: string): string {
  return color + text + RESET;
}

/** Shorthand for paint(fg(hex), text). */
export function colorize(hex: string, text: string): string {
  return paint(fg(hex), text);
}

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Three-stop gradient: 0 → start, 0.5 → middle, 1 → end. Returns a foreground escape. */
export function gradient(stops: readonly [Rgb, Rgb, Rgb], t: number): string {
  const [start, middle, end] = stops;
  return fgRgb(t < 0.5 ? mix(start, middle, t * 2) : mix(middle, end, (t - 0.5) * 2));
}
