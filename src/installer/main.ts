/**
 * Install claude-statusline into ~/.claude and point settings.json at it.
 *
 *   curl -fsSL https://github.com/DDDDD12138/claude-statusline/releases/latest/download/install.mjs | node -
 *
 *   --version <tag>  install that release instead of the latest
 *   --dry-run        show what would change without writing anything
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { ASSET, assetUrl, bundleLabel } from './release.ts';
import { mergeSettings, STATUS_LINE } from './settings.ts';

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: { version: { type: 'string' }, 'dry-run': { type: 'boolean' } },
  });
  const dryRun = values['dry-run'] === true;
  const claudeDir = join(homedir(), '.claude');
  const target = join(claudeDir, ASSET);
  const settingsPath = join(claudeDir, 'settings.json');

  const url = assetUrl(values.version);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download failed (${response.status}): ${url}`);
  const bundle = await response.text();
  const label = bundleLabel(bundle);

  const current = existsSync(settingsPath) ? readFileSync(settingsPath, 'utf8') : undefined;
  let settings: ReturnType<typeof mergeSettings>;
  try {
    settings = mergeSettings(current, STATUS_LINE);
  } catch (err) {
    throw new Error(`${settingsPath}: ${err instanceof Error ? err.message : String(err)}`);
  }

  const log = (line: string) => process.stdout.write(`${line}\n`);
  log(`${dryRun ? 'would install' : 'installing'} claude-statusline ${label}`);
  log(`  ${target}`);
  log(
    settings.changed
      ? `  ${settingsPath}: set statusLine → ${STATUS_LINE.command}`
      : `  ${settingsPath}: statusLine already configured`,
  );
  if (dryRun) return;

  mkdirSync(claudeDir, { recursive: true });
  writeFileSync(`${target}.tmp`, bundle);
  renameSync(`${target}.tmp`, target);
  if (settings.changed) writeFileSync(settingsPath, settings.text);
  log('done. Start a new Claude Code session to see it.');
}

main().catch((err: unknown) => {
  process.stderr.write(`install: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
