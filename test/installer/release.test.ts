import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assetUrl, bundleLabel } from '../../src/installer/release.ts';

describe('assetUrl', () => {
  it('points at the latest release by default', () => {
    assert.equal(
      assetUrl(),
      'https://github.com/DDDDD12138/claude-statusline/releases/latest/download/statusline.mjs',
    );
  });

  it('points at a specific tag when given', () => {
    assert.equal(
      assetUrl('0.0.1'),
      'https://github.com/DDDDD12138/claude-statusline/releases/download/0.0.1/statusline.mjs',
    );
  });
});

describe('bundleLabel', () => {
  it('reads the label from the banner', () => {
    assert.equal(bundleLabel('// claude-statusline 0.0.1\n// Generated file\ncode'), '0.0.1');
    assert.equal(
      bundleLabel('// claude-statusline dev build 2026-10-12T16:47Z\n'),
      'dev build 2026-10-12T16:47Z',
    );
  });

  it('rejects anything that is not our bundle', () => {
    assert.throws(() => bundleLabel('<!DOCTYPE html>'), /not a claude-statusline bundle/);
    assert.throws(() => bundleLabel(''), /not a claude-statusline bundle/);
  });
});
