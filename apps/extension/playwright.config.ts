import { defineConfig } from "@playwright/test";

/** Pruebas E2E de la extensión. Requieren `pnpm build` (carpeta dist/). */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
});
