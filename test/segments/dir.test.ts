import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { displayDir, resolveCwd } from '../../src/segments/dir.ts';

describe('displayDir', () => {
  const home = '/home/me';

  it('collapses home to ~', () => {
    assert.equal(displayDir('/home/me', home, false), '~');
    assert.equal(displayDir('/home/me/', home, false), '~');
    assert.equal(displayDir('/home/me/work/app', home, false), '~/work/app');
  });

  it('does not collapse a sibling that merely shares the prefix', () => {
    assert.equal(displayDir('/home/me2/app', home, false), '/home/me2/app');
  });

  it('leaves paths outside home alone, minus trailing slashes', () => {
    assert.equal(displayDir('/tmp/x/', home, false), '/tmp/x');
    assert.equal(displayDir('/', home, false), '');
  });

  it('normalizes Windows separators and compares case-insensitively when asked', () => {
    const winHome = 'C:\\Users\\Me';
    assert.equal(displayDir('c:\\users\\me\\proj\\', winHome, true), '~/proj');
    assert.equal(displayDir('c:\\users\\me\\proj', winHome, false), 'c:/users/me/proj');
    assert.equal(displayDir('D:\\data', winHome, true), 'D:/data');
  });
});

describe('resolveCwd', () => {
  it('prefers workspace.current_dir, then cwd, then the process cwd', () => {
    assert.equal(resolveCwd({ workspace: { current_dir: '/a' }, cwd: '/b' }), '/a');
    assert.equal(resolveCwd({ cwd: '/b' }), '/b');
    assert.equal(resolveCwd({}), process.cwd());
  });
});
