/**
 * Bundle the status line and the installer into dist/.
 *
 *   node scripts/build.ts          one-shot build
 *   node scripts/build.ts --watch  rebuild on change and preview each result
 *
 * Not minified: the bundles run locally, and readable stack traces matter more.
 */
import { fileURLToPath } from 'node:url';
import { type BuildOptions, build, context } from 'esbuild';
import { preview } from './preview.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WATCH = process.argv.includes('--watch');

/** Release builds are identified by their git tag, dev builds by their build time. */
const TAG = process.env['STATUSLINE_VERSION'];
const BUILD_LABEL = TAG || `dev build ${new Date().toISOString().slice(0, 16)}Z`;

const shared: BuildOptions = {
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  charset: 'utf8',
  banner: {
    js: [
      `// claude-statusline ${BUILD_LABEL}`,
      '// Generated file: edit the TypeScript sources in the repository instead.',
    ].join('\n'),
  },
  logLevel: 'info',
  absWorkingDir: ROOT,
};

const statusline: BuildOptions = {
  ...shared,
  entryPoints: ['src/main.ts'],
  outfile: 'dist/statusline.mjs',
};

const installer: BuildOptions = {
  ...shared,
  entryPoints: ['src/installer/main.ts'],
  outfile: 'dist/install.mjs',
};

if (WATCH) {
  await build(installer);
  const ctx = await context({
    ...statusline,
    plugins: [
      {
        name: 'preview',
        setup(b) {
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
  await Promise.all([build(statusline), build(installer)]);
}
