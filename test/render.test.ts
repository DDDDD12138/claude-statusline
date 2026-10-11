import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { renderLine } from '../src/render.ts';
import type { Segment } from '../src/segments/segment.ts';
import { ctx, stripAnsi } from './helpers.ts';

describe('renderLine', () => {
  const a: Segment = () => 'A';
  const b: Segment = () => 'B';
  const hidden: Segment = () => null;
  const empty: Segment = () => '';
  const broken: Segment = () => {
    throw new Error('boom');
  };

  it('joins visible segments with the separator', () => {
    assert.equal(stripAnsi(renderLine([a, b], ctx({}))), 'A · B');
  });

  it('drops null and empty segments without leaving a dangling separator', () => {
    assert.equal(stripAnsi(renderLine([a, hidden, empty, b], ctx({}))), 'A · B');
  });

  it('skips a throwing segment and keeps the rest', () => {
    assert.equal(stripAnsi(renderLine([a, broken, b], ctx({}))), 'A · B');
  });

  it('returns an empty string when nothing is visible', () => {
    assert.equal(renderLine([hidden, broken], ctx({})), '');
  });
});
