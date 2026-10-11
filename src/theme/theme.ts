/** All colors are hex strings; conversion to ANSI happens at render time. */
export interface Theme {
  readonly model: string;
  readonly effort: string;
  readonly dir: string;
  readonly branch: string;
  readonly separator: string;
  readonly dim: string;
  /** Unfilled cells of the context bar. */
  readonly barEmpty: string;
  /** Context bar gradient: low usage → mid → high usage. */
  readonly barGradient: readonly [string, string, string];
}
