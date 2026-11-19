// Empaqueta dist/ en un .zip listo para "Cargar descomprimida" en Chrome o para la Chrome Web Store.
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = "yigora-extension-demo.zip";
if (!existsSync(`${root}dist/manifest.json`)) {
  throw new Error("Falta dist/: ejecute primero `pnpm build`.");
}
rmSync(`${root}${output}`, { force: true });
execFileSync("zip", ["-r", "-q", `../${output}`, "."], { cwd: `${root}dist`, stdio: "inherit" });
console.log(`Paquete creado: apps/extension/${output}`);
