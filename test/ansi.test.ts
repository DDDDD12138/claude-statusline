import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { colorize, fg, gradient, hexToRgb, mix, paint, RESET } from '../src/ansi.ts';

describe('ansi', () => {
  it('parses hex colors', () => {
    assert.deepEqual(hexToRgb('#7aa2f7'), [0x7a, 0xa2, 0xf7]);
    assert.deepEqual(hexToRgb('#000000'), [0, 0, 0]);
    assert.deepEqual(hexToRgb('#ffffff'), [255, 255, 255]);
  });

  it('emits 24-bit foreground escapes', () => {
    assert.equal(fg('#7aa2f7'), '\x1b[38;2;122;162;247m');
  });

  it('paints and resets', () => {
    assert.equal(paint(fg('#000000'), 'x'), `\x1b[38;2;0;0;0mx${RESET}`);
    assert.equal(colorize('#000000', 'x'), paint(fg('#000000'), 'x'));
  });

  it('mixes linearly and rounds', () => {
    assert.deepEqual(mix([0, 0, 0], [255, 255, 255], 0), [0, 0, 0]);
    assert.deepEqual(mix([0, 0, 0], [255, 255, 255], 1), [255, 255, 255]);
    assert.deepEqual(mix([0, 0, 0], [255, 255, 255], 0.5), [128, 128, 128]);
  });

  it('gradient hits its stops at 0, 0.5 and 1', () => {
    const stops = [hexToRgb('#9ece6a'), hexToRgb('#e0af68'), hexToRgb('#f7768e')] as const;
    assert.equal(gradient(stops, 0), fg('#9ece6a'));
    assert.equal(gradient(stops, 0.5), fg('#e0af68'));
    assert.equal(gradient(stops, 1), fg('#f7768e'));
  });
});
