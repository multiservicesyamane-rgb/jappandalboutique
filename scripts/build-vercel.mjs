/**
 * Custom Vercel Build Output API script.
 *
 * Why: @vercel/node compiles TypeScript to individual ESM files without .js
 * extensions, causing Node.js 24 strict-ESM resolution to fail at runtime
 * (FUNCTION_INVOCATION_FAILED). This script bundles the API handler into a
 * single CJS file with esbuild, bypassing that issue entirely.
 */

import { execSync } from 'node:child_process';
import { mkdirSync, cpSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, '.vercel/output');

// Clean previous Vercel output
if (existsSync(OUTPUT)) {
  rmSync(OUTPUT, { recursive: true });
}

// 1. Build frontend with Vite
console.log('\n[1/5] Building frontend with Vite...');
execSync('npx vite build', { stdio: 'inherit', cwd: ROOT });

// 2. Create output directory structure
console.log('\n[2/5] Creating output directory structure...');
mkdirSync(join(OUTPUT, 'static'), { recursive: true });
mkdirSync(join(OUTPUT, 'functions/api/trpc/[trpc].func'), { recursive: true });

// 3. Copy static files
console.log('\n[3/5] Copying static files...');
cpSync(join(ROOT, 'dist/public'), join(OUTPUT, 'static'), { recursive: true });

// 4. Bundle API handler with esbuild into a single CJS file
console.log('\n[4/5] Bundling API handler with esbuild...');
execSync(
  [
    'npx esbuild',
    'api/trpc/[trpc].ts',
    '--bundle',
    '--platform=node',
    '--format=cjs',
    '--target=node24',
    '--outfile=.vercel/output/functions/api/trpc/[trpc].func/index.js',
    '--log-level=info',
  ].join(' '),
  { stdio: 'inherit', cwd: ROOT }
);

// Write a local package.json so Node.js treats index.js as CommonJS
// (the root package.json has "type":"module" which would break CJS output)
writeFileSync(
  join(OUTPUT, 'functions/api/trpc/[trpc].func/package.json'),
  JSON.stringify({ type: 'commonjs' }, null, 2)
);

// 5. Write Vercel function and output configs
console.log('\n[5/5] Writing configuration files...');

writeFileSync(
  join(OUTPUT, 'functions/api/trpc/[trpc].func/.vc-config.json'),
  JSON.stringify({
    handler: 'index.js',
    runtime: 'nodejs24.x',
    architecture: 'x86_64',
    maxDuration: 30,
    environment: {},
    shouldDisableAutomaticFetchInstrumentation: false,
    launcherType: 'Nodejs',
    shouldAddHelpers: true,
    shouldAddSourcemapSupport: false,
    awsLambdaHandler: '',
  }, null, 2)
);

writeFileSync(
  join(OUTPUT, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      // SPA fallback: all non-API routes → index.html
      { src: '^(?:/((?!api/).*))?$', dest: '/index.html', check: true },
      // tRPC handler: /api/trpc/<path> → function with ?trpc=<path>
      {
        src: '^/api/trpc/([^/]+(?:/[^/]+)*)$',
        dest: '/api/trpc/[trpc]?trpc=$1',
        check: true,
      },
      // All other /api/* → 404
      { src: '^/api(/.*)?$', status: 404 },
      { handle: 'error' },
      { status: 404, src: '^(?!/api).*$', dest: '/404.html' },
    ],
    framework: { version: '6.4.2' },
    crons: [],
  }, null, 2)
);

console.log('\n✅ Vercel build complete!');
console.log(`   Static: ${join(OUTPUT, 'static')}`);
console.log(`   Function: ${join(OUTPUT, 'functions/api/trpc/[trpc].func/index.js')}`);
