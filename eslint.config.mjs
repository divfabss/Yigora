// @ts-check
import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Reglas de capas (docs/ARCHITECTURE.md §2): los paquetes nunca importan desde apps. */
const forbidAppsImports = {
  group: ["@yigora/web", "@yigora/web/*", "**/apps/**"],
  message: "Los paquetes no pueden depender de aplicaciones.",
};

export default defineConfig(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/next-env.d.ts",
      "supabase/**",
    ],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { "import-x": importX },
    settings: {
      "import-x/extensions": [".ts", ".tsx"],
      "import-x/parsers": { "@typescript-eslint/parser": [".ts", ".tsx"] },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: ["apps/*/tsconfig.json", "packages/*/tsconfig.json"],
          noWarnOnMultipleProjects: true,
        }),
      ],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "import-x/no-cycle": "error",
      "import-x/no-self-import": "error",
      "no-console": "error",
      eqeqeq: ["error", "always"],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", 3],
      complexity: ["error", 12],
    },
  },
  {
    files: ["packages/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": ["error", { patterns: [forbidAppsImports] }] },
  },
  {
    files: ["packages/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            forbidAppsImports,
            { group: ["@yigora/*"], message: "domain no depende de otros paquetes internos." },
            {
              group: ["react", "next", "next/*", "@supabase/*"],
              message: "domain no depende de infraestructura.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
    settings: { next: { rootDir: "apps/web" } },
  },
  {
    // El logger es el único punto autorizado para escribir en consola.
    files: ["apps/web/src/server/logging/logger.ts"],
    rules: { "no-console": "off" },
  },
  {
    files: ["**/*.test.ts", "**/e2e/**/*.ts"],
    rules: { "max-lines": "off" },
  },
  {
    files: ["**/*.{js,mjs,cjs}", "**/*.config.ts"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
