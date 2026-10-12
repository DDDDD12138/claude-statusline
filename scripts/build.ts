/**
 * Bundle src/main.ts into dist/statusline.mjs.
 *
 *   node scripts/build.ts          one-shot build
 *   node scripts/build.ts --watch  rebuild on change and preview each result
 *
 * Not minified: the bundle runs locally, and readable stack traces matter more.
 */
import { fileURLToPath } from 'node:url';
import { type BuildOptions, build, context } from 'esbuild';
import { preview } from './preview.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WATCH = process.argv.includes('--watch');

/** Release builds are identified by their git tag, dev builds by their build time. */
const TAG = process.env['STATUSLINE_VERSION'];
const BUILD_LABEL = TAG || `dev build ${new Date().toISOString().slice(0, 16)}Z`;

const options: BuildOptions = {
  entryPoints: ['src/main.ts'],
  outfile: 'dist/statusline.mjs',
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

if (WATCH) {
  const ctx = await context({
    ...options,
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
  await build(options);
}
