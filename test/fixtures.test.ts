import assert from 'node:assert/strict';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { renderLine } from '../src/render.ts';
import { segments } from '../src/segments/index.ts';
import type { StatusLineInput } from '../src/types.ts';
import { ctx, stripAnsi } from './helpers.ts';

const FIXTURES = fileURLToPath(new URL('./fixtures', import.meta.url));
const BAR = '━'.repeat(8);

/**
 * Each fixture rendered through the real segment list, compared against a
 * line written by hand from the fixture's fields. Colors are covered by the
 * unit tests; this checks that the segments compose into the expected text.
 * The directory is pinned to a path that does not exist so the git segment is
 * deterministic (hidden) and the output does not depend on the machine.
 */
const EXPECTED: Record<string, string> = {
  // Fable 5.1, effort high, 31% of 200k
  'active.json': `Fable 5.1 high · /fixture/project · ${BAR} 31% /200k`,
  // The docs' example: Opus, effort high, 8% of 200k
  'docs-full-schema.json': `Opus high · /fixture/project · ${BAR} 8% /200k`,
  // No fields at all: model falls back to ?, no window size
  'empty.json': `? · /fixture/project · ${BAR} 0%`,
  // Opus 5.5, effort max, 92.6% floors to 92, 1M window
  'near-limit.json': `Opus 5.5 max · /fixture/project · ${BAR} 92% /1M`,
  // Session just started: no effort, used_percentage null → 0, window known
  'session-start.json': `Fable 5.1 · /fixture/project · ${BAR} 0% /200k`,
};

describe('fixtures render as expected', () => {
  const sessionId = `fixtures-${process.pid}-${Date.now()}`;
  after(() => rmSync(join(tmpdir(), `claude-sl-git-${sessionId}.txt`), { force: true }));

  for (const [file, expected] of Object.entries(EXPECTED)) {
    it(file, () => {
      const input = JSON.parse(readFileSync(join(FIXTURES, file), 'utf8')) as StatusLineInput;
      input.workspace = { ...input.workspace, current_dir: '/fixture/project' };
      input.session_id = sessionId;
      assert.equal(stripAnsi(renderLine(segments, ctx(input))), expected);
    });
  }

  it('every fixture file has an expectation', () => {
    const files = readdirSync(FIXTURES).filter((f) => f.endsWith('.json'));
    assert.deepEqual(files.sort(), Object.keys(EXPECTED).sort());
  });
});
