import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { currentBranch, gitSegment } from '../../src/segments/git.ts';
import { ctx, gitEnv, stripAnsi, tempDir, tempRepo } from '../helpers.ts';

describe('currentBranch', () => {
  let repo: ReturnType<typeof tempRepo>;
  let plain: ReturnType<typeof tempDir>;
  before(() => {
    repo = tempRepo();
    plain = tempDir();
  });
  after(() => {
    repo.cleanup();
    plain.cleanup();
  });

  it('returns the branch name', () => {
    assert.equal(currentBranch(repo.path), 'main');
  });

  it('returns the short sha when HEAD is detached', () => {
    const sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: repo.path,
      encoding: 'utf8',
    }).trim();
    execFileSync('git', ['checkout', '-q', '--detach'], { cwd: repo.path, env: gitEnv() });
    assert.equal(currentBranch(repo.path), sha);
    execFileSync('git', ['checkout', '-q', 'main'], { cwd: repo.path, env: gitEnv() });
  });

  it('returns empty outside a repository or for a missing directory', () => {
    assert.equal(currentBranch(plain.path), '');
    assert.equal(currentBranch(join(plain.path, 'does-not-exist')), '');
  });
});

describe('git segment', () => {
  let repo: ReturnType<typeof tempRepo>;
  let plain: ReturnType<typeof tempDir>;
  const sessionId = `test-${process.pid}-${Date.now()}`;
  const cacheFile = join(tmpdir(), `claude-sl-git-${sessionId}.txt`);
  before(() => {
    repo = tempRepo();
    plain = tempDir();
  });
  after(() => {
    repo.cleanup();
    plain.cleanup();
    rmSync(cacheFile, { force: true });
    rmSync(`${cacheFile.slice(0, -4)}-plain.txt`, { force: true });
  });

  it('hides itself outside a repository', () => {
    const out = gitSegment(
      ctx({ workspace: { current_dir: plain.path }, session_id: `${sessionId}-plain` }),
    );
    assert.equal(out, null);
  });

  it('renders the branch and serves the cached value for the same session', () => {
    const first = gitSegment(ctx({ workspace: { current_dir: repo.path }, session_id: sessionId }));
    assert.equal(stripAnsi(first ?? ''), 'main');
    // Same session, different (non-git) directory: the 5s cache must answer, not git.
    const second = gitSegment(
      ctx({ workspace: { current_dir: plain.path }, session_id: sessionId }),
    );
    assert.equal(second, first);
  });
});
