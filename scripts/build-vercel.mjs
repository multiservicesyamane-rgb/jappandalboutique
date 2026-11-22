/**
 * Build Vercel (Build Output API v3) — projet classique (un seul service).
 *
 * Pourquoi un build custom : @vercel/node compile la TypeScript en fichiers ESM
 * sans extension .js, ce qui casse la résolution stricte ESM de Node.
 * esbuild produit ici un bundle CJS autonome dans chaque fonction.
 */

import { execSync } from "node:child_process";
import { mkdirSync, cpSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT = join(ROOT, ".vercel", "output");

if (existsSync(OUTPUT)) rmSync(OUTPUT, { recursive: true });

// 1) Frontend
console.log("\n[1/6] Building frontend with Vite...");
execSync("npx vite build", { stdio: "inherit", cwd: ROOT });

// 2) Arborescence de la sortie
console.log("\n[2/6] Creating build output structure...");
mkdirSync(join(OUTPUT, "static"), { recursive: true });
mkdirSync(join(OUTPUT, "functions", "api", "trpc", "[trpc].func"), { recursive: true });
mkdirSync(join(OUTPUT, "functions", "api", "cron", "social.func"), { recursive: true });

// 3) Fichiers statiques
console.log("\n[3/6] Copying static files...");
cpSync(join(ROOT, "dist", "public"), join(OUTPUT, "static"), { recursive: true });

// 4) Fonctions
console.log("\n[4/6] Bundling API functions with esbuild...");
const bundle = (entry, outfile) =>
  execSync(
    [
      "npx esbuild",
      entry,
      "--bundle",
      "--platform=node",
      "--format=cjs",
      "--target=node22",
      `--outfile=${outfile}`,
      "--log-level=warning",
      "--footer:js=module.exports=module.exports.default??module.exports;",
    ].join(" "),
    { stdio: "inherit", cwd: ROOT }
  );

const trpcFunc = join(OUTPUT, "functions", "api", "trpc", "[trpc].func");
const cronFunc = join(OUTPUT, "functions", "api", "cron", "social.func");

bundle("server/vercel-handler.ts", join(trpcFunc, "index.js"));
bundle("server/cron-handler.ts", join(cronFunc, "index.js"));

// La racine du projet est "type": "module" → forcer CommonJS pour les fonctions
for (const dir of [trpcFunc, cronFunc]) {
  writeFileSync(join(dir, "package.json"), JSON.stringify({ type: "commonjs" }, null, 2));
}

// 5) Routes
console.log("\n[5/6] Writing routes configuration...");
writeFileSync(
  join(OUTPUT, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        // API functions
        {
          src: "^/api/trpc/([^/]+(?:/[^/]+)*)$",
          dest: "/api/trpc/[trpc]?trpc=$1",
          check: true,
        },
        { src: "^/api/cron/social$", dest: "/api/cron/social", check: true },
        { src: "^/api(/.*)?$", status: 404 },
        // SPA fallback
        { src: "^(?:/((?!api/).*))?$", dest: "/index.html", check: true },
        { handle: "error" },
        { status: 404, src: "^(?!/api).*$", dest: "/404.html" },
      ],
      framework: { version: "6.4.2" },
      crons: [{ path: "/api/cron/social", schedule: "*/5 * * * *" }],
    },
    null,
    2
  )
);

// 6) Configuration des fonctions
console.log("\n[6/6] Writing functions configuration...");
for (const dir of [trpcFunc, cronFunc]) {
  writeFileSync(
    join(dir, ".vc-config.json"),
    JSON.stringify(
      {
        handler: "index.js",
        runtime: "nodejs22.x",
        architecture: "x86_64",
        maxDuration: 60,
        environment: {},
        shouldDisableAutomaticFetchInstrumentation: false,
        launcherType: "Nodejs",
        shouldAddHelpers: true,
        shouldAddSourcemapSupport: false,
        awsLambdaHandler: "",
      },
      null,
      2
    )
  );
}

console.log("\n✅ Vercel build complete!");
console.log(`   Static  : ${join(OUTPUT, "static")}`);
console.log(`   tRPC    : ${join(trpcFunc, "index.js")}`);
console.log(`   Cron    : ${join(cronFunc, "index.js")}`);
