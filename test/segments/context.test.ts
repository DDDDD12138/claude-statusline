import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { contextSegment, formatTokens, renderContext } from '../../src/segments/context.ts';
import { tokyoNight } from '../../src/theme/tokyo-night.ts';
import { ctx, stripAnsi } from '../helpers.ts';

const CELL = '━';

describe('formatTokens', () => {
  it('formats thousands and millions', () => {
    assert.equal(formatTokens(200_000), '200k');
    assert.equal(formatTokens(1_000_000), '1M');
    assert.equal(formatTokens(1_500_000), '1.5M');
    assert.equal(formatTokens(999), '1k');
  });
});

describe('renderContext', () => {
  const plain = (pct: number, size?: number) => stripAnsi(renderContext(pct, size, tokyoNight));

  it('always draws eight cells, then percent and window size', () => {
    assert.equal(plain(31, 200_000), `${CELL.repeat(8)} 31% /200k`);
    assert.equal(plain(0, 1_000_000), `${CELL.repeat(8)} 0% /1M`);
  });

  it('omits the window size when unknown', () => {
    assert.equal(plain(50), `${CELL.repeat(8)} 50%`);
  });

  it('fills cells proportionally and colors empty cells with the theme', () => {
    const empty = tokyoNight.barEmpty.slice(1);
    const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(empty.slice(i, i + 2), 16));
    const emptyEsc = `\x1b[38;2;${r};${g};${b}m`;
    const countEmpty = (s: string) => s.split(emptyEsc).length - 1;
    assert.equal(countEmpty(renderContext(0, undefined, tokyoNight)), 8);
    assert.equal(countEmpty(renderContext(50, undefined, tokyoNight)), 4);
    assert.equal(countEmpty(renderContext(100, undefined, tokyoNight)), 0);
  });
});

describe('context segment', () => {
  it('floors the percentage and tolerates null', () => {
    const out = (used: number | null) =>
      stripAnsi(
        contextSegment(
          ctx({ context_window: { used_percentage: used, context_window_size: 200_000 } }),
        ) ?? '',
      );
    assert.equal(out(92.6), `${CELL.repeat(8)} 92% /200k`);
    assert.equal(out(null), `${CELL.repeat(8)} 0% /200k`);
  });

  it('renders 0% without a context_window object', () => {
    assert.equal(stripAnsi(contextSegment(ctx({})) ?? ''), `${CELL.repeat(8)} 0%`);
  });
});
