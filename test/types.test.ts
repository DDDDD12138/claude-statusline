import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { StatusLineInput } from '../src/types.ts';
import docsFullSchema from './fixtures/docs-full-schema.json' with { type: 'json' };

/**
 * JSON imports widen string literals to `string`, so the fixture is compared
 * against a literal-widened view of the interface. This still checks the
 * object structure, number vs string, arrays, and nullability.
 */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

describe('StatusLineInput', () => {
  it('matches the full example payload from the official docs (checked at compile time)', () => {
    const checked = docsFullSchema satisfies Widen<StatusLineInput>;
    assert.ok(checked);
  });
});
