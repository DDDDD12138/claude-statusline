import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergeSettings, STATUS_LINE } from '../../src/installer/settings.ts';

describe('mergeSettings', () => {
  it('creates the file when it does not exist', () => {
    const { text, changed } = mergeSettings(undefined, STATUS_LINE);
    assert.equal(changed, true);
    assert.deepEqual(JSON.parse(text), { statusLine: STATUS_LINE });
    assert.ok(text.endsWith('}\n'));
  });

  it('keeps other keys and their order, appending statusLine', () => {
    const { text } = mergeSettings('{\n  "theme": "dark",\n  "model": "fable"\n}\n', STATUS_LINE);
    assert.deepEqual(Object.keys(JSON.parse(text)), ['theme', 'model', 'statusLine']);
    assert.equal(JSON.parse(text).theme, 'dark');
  });

  it('replaces an existing statusLine in place', () => {
    const before = { statusLine: { type: 'command', command: 'old.sh' }, theme: 'dark' };
    const { text, changed } = mergeSettings(JSON.stringify(before), STATUS_LINE);
    assert.equal(changed, true);
    assert.deepEqual(Object.keys(JSON.parse(text)), ['statusLine', 'theme']);
    assert.deepEqual(JSON.parse(text).statusLine, STATUS_LINE);
  });

  it('reports no change when statusLine already matches', () => {
    const current = JSON.stringify({ theme: 'dark', statusLine: STATUS_LINE }, null, 2);
    assert.equal(mergeSettings(current, STATUS_LINE).changed, false);
  });

  it('preserves four-space and tab indentation', () => {
    const four = mergeSettings('{\n    "theme": "dark"\n}\n', STATUS_LINE).text;
    assert.match(four, /^ {4}"theme"/m);
    const tab = mergeSettings('{\n\t"theme": "dark"\n}\n', STATUS_LINE).text;
    assert.match(tab, /^\t"theme"/m);
  });

  it('treats an empty file as empty settings', () => {
    assert.deepEqual(JSON.parse(mergeSettings('  \n', STATUS_LINE).text), {
      statusLine: STATUS_LINE,
    });
  });

  it('refuses to overwrite a file it cannot parse', () => {
    assert.throws(() => mergeSettings('{ not json', STATUS_LINE), SyntaxError);
    assert.throws(() => mergeSettings('[]', STATUS_LINE), /JSON object/);
  });
});
