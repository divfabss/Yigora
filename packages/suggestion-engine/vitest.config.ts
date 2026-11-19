import { defineProject } from "vitest/config";

export default defineProject({
  test: { name: "suggestion-engine", environment: "node", include: ["src/**/*.test.ts"] },
});
