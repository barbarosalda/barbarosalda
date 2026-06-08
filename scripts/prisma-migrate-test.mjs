/* global console, process */
import { spawnSync } from "node:child_process";
import { config } from "dotenv";

config({ path: ".env.test" });

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  console.error("Missing DATABASE_URL in .env.test");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["prisma", "migrate", "deploy"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    shell: process.platform === "win32",
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
