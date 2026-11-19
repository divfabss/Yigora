import { resolve } from "node:path";
import { defineConfig } from "vite";

/** El content script debe ser un script clásico (IIFE), sin imports dinámicos. */
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    target: "chrome116",
    sourcemap: false,
    copyPublicDir: false,
    lib: {
      entry: resolve(import.meta.dirname, "src/content/index.ts"),
      formats: ["iife"],
      name: "yigoraContent",
      fileName: () => "content.js",
    },
  },
});
