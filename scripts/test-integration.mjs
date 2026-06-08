/* global console, process */
import { spawnSync } from "node:child_process";
import { config } from "dotenv";

const envPath = ".env.test";
const loaded = config({ path: envPath });

if (loaded.error) {
  console.error(`Failed to load ${envPath}: ${loaded.error.message}`);
  process.exit(1);
}

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  console.error(`Missing DATABASE_URL in ${envPath}`);
  process.exit(1);
}

const baseEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
};

const migrateResult = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: baseEnv,
  shell: process.platform === "win32",
});

if (migrateResult.error) {
  console.error(migrateResult.error.message);
  process.exit(1);
}

if ((migrateResult.status ?? 1) !== 0) {
  process.exit(migrateResult.status ?? 1);
}

const vitestResult = spawnSync(
  "npx",
  ["vitest", "run", "--config", "vitest.integration.config.ts"],
  {
    stdio: "inherit",
    env: baseEnv,
    shell: process.platform === "win32",
  },
);

if (vitestResult.error) {
  console.error(vitestResult.error.message);
  process.exit(1);
}

process.exit(vitestResult.status ?? 1);
