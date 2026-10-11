/**
 * Bundle src/main.ts into dist/statusline.mjs.
 *
 *   node scripts/build.ts          one-shot build
 *   node scripts/build.ts --watch  rebuild on change and preview each result
 *
 * The bundle stays readable on purpose: it is a 5 KB file that runs locally,
 * minification saves nothing measurable and would ruin stack traces.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { type BuildOptions, build, context } from 'esbuild';
import { preview } from './preview.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PACKAGE_NAME = 'claude-statusline';
const WATCH = process.argv.includes('--watch');

function git(args: readonly string[]): string | null {
  try {
    return execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

/** Where readers of the installed file should look for the source. */
function sourceLocation(): string {
  const remote = git(['remote', 'get-url', 'origin']);
  if (!remote) return PACKAGE_NAME;
  // git@github.com:user/repo.git → https://github.com/user/repo
  return remote.replace(/^git@([^:]+):/, 'https://$1/').replace(/\.git$/, '');
}

/**
 * Two-line header for the bundle. A build made exactly on a tag from a clean
 * tree is a release and carries only the tag, so rebuilding it is reproducible
 * byte for byte. Anything else is a dev build and records its state and time.
 */
function banner(): string {
  const described = git(['describe', '--tags', '--always', '--dirty']) ?? 'unknown';
  const isRelease = /^v?\d+\.\d+\.\d+$/.test(described);
  const minute = new Date().toISOString().slice(0, 16);
  const version = isRelease ? described : `${described} (dev build, ${minute}Z)`;
  return [
    `// ${PACKAGE_NAME} ${version}`,
    `// Generated from ${sourceLocation()} — edits are overwritten by the next install.`,
  ].join('\n');
}

const options: BuildOptions = {
  entryPoints: ['src/main.ts'],
  outfile: 'dist/statusline.mjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  charset: 'utf8',
  banner: { js: banner() },
  logLevel: 'info',
  absWorkingDir: ROOT,
};

if (WATCH) {
  const ctx = await context({
    ...options,
    plugins: [
      {
        name: 'preview',
        setup(b) {
          b.onStart(() => {
            options.banner = { js: banner() };
          });
          b.onEnd((result) => {
            if (result.errors.length > 0) return;
            const time = new Date().toLocaleTimeString();
            process.stdout.write(`\n\x1b[2m── rebuilt ${time} ──\x1b[0m\n`);
            preview();
          });
        },
      },
    ],
  });
  await ctx.watch();
  process.stdout.write('watching src/ … (Ctrl+C to stop)\n');
} else {
  await build(options);
}
