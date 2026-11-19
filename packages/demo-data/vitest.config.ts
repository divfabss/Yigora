import { defineProject } from "vitest/config";

export default defineProject({
  test: { name: "demo-data", environment: "node", include: ["src/**/*.test.ts"] },
});
