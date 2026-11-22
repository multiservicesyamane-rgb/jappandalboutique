/**
 * Build Vercel (Build Output API v3) en mode "Services".
 *
 * Un seul service applicatif `jappandal` contient :
 *   - le frontend statique (Vite)
 *   - la fonction tRPC  /api/trpc/[trpc]
 *   - la fonction cron  /api/cron/social
 *
 * Pourquoi un build custom : @vercel/node compile la TypeScript en fichiers ESM
 * sans extension .js, ce qui casse la résolution stricte ESM de Node 24.
 * esbuild produit ici un bundle CJS autonome dans chaque fonction.
 */

import { execSync } from "node:child_process";
import { mkdirSync, cpSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT = join(ROOT, ".vercel", "output");
const SERVICE = "jappandal";
const SERVICE_OUT = join(OUTPUT, "services", SERVICE);

if (existsSync(OUTPUT)) rmSync(OUTPUT, { recursive: true });

// 1) Frontend
console.log("\n[1/6] Building frontend with Vite...");
execSync("npx vite build", { stdio: "inherit", cwd: ROOT });

// 2) Arborescence du service
console.log("\n[2/6] Creating service output structure...");
mkdirSync(join(SERVICE_OUT, "static"), { recursive: true });
mkdirSync(join(SERVICE_OUT, "functions", "api", "trpc", "[trpc].func"), { recursive: true });
mkdirSync(join(SERVICE_OUT, "functions", "api", "cron", "social.func"), { recursive: true });

// 3) Fichiers statiques
console.log("\n[3/6] Copying static files...");
cpSync(join(ROOT, "dist", "public"), join(SERVICE_OUT, "static"), { recursive: true });

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
      "--target=node24",
      `--outfile=${outfile}`,
      "--log-level=warning",
      "--footer:js=module.exports=module.exports.default??module.exports;",
    ].join(" "),
    { stdio: "inherit", cwd: ROOT }
  );

const trpcFunc = join(SERVICE_OUT, "functions", "api", "trpc", "[trpc].func");
const cronFunc = join(SERVICE_OUT, "functions", "api", "cron", "social.func");

bundle("server/vercel-handler.ts", join(trpcFunc, "index.js"));
bundle("server/cron-handler.ts", join(cronFunc, "index.js"));

// La racine du projet est "type": "module" → forcer CommonJS pour les fonctions
for (const dir of [trpcFunc, cronFunc]) {
  writeFileSync(join(dir, "package.json"), JSON.stringify({ type: "commonjs" }, null, 2));
}

// 5) Configuration du service (routes internes)
console.log("\n[5/6] Writing service configuration...");
writeFileSync(
  join(SERVICE_OUT, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        //API functions
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
    },
    null,
    2
  )
);

writeFileSync(
  join(trpcFunc, ".vc-config.json"),
  JSON.stringify(
    {
      handler: "index.js",
      runtime: "nodejs24.x",
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

writeFileSync(
  join(cronFunc, ".vc-config.json"),
  JSON.stringify(
    {
      handler: "index.js",
      runtime: "nodejs24.x",
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

// 6) Configuration globale (services + cron)
console.log("\n[6/6] Writing top-level configuration...");
writeFileSync(
  join(OUTPUT, "config.json"),
  JSON.stringify(
    {
      version: 3,
      services: [{ name: SERVICE, root: ".", runtime: "nodejs24.x" }],
      crons: [{ path: "/api/cron/social", schedule: "*/5 * * * *" }],
    },
    null,
    2
  )
);

console.log("\n✅ Vercel build complete (services mode)");
console.log(`   Service : ${SERVICE_OUT}`);
console.log(`   Static  : ${join(SERVICE_OUT, "static")}`);
console.log(`   tRPC    : ${join(trpcFunc, "index.js")}`);
console.log(`   Cron    : ${join(cronFunc, "index.js")}`);
