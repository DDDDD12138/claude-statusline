import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { modelSegment } from '../../src/segments/model.ts';
import { ctx, stripAnsi } from '../helpers.ts';

describe('model segment', () => {
  it('shows display name and effort level', () => {
    const out = modelSegment(
      ctx({ model: { display_name: 'Fable 5.1' }, effort: { level: 'high' } }),
    );
    assert.equal(stripAnsi(out ?? ''), 'Fable 5.1 high');
  });

  it('omits effort when absent', () => {
    const out = modelSegment(ctx({ model: { display_name: 'Opus 5.5' } }));
    assert.equal(stripAnsi(out ?? ''), 'Opus 5.5');
  });

  it('falls back to ? without a model', () => {
    assert.equal(stripAnsi(modelSegment(ctx({})) ?? ''), '?');
  });
});
