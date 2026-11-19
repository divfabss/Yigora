import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Garantía estática (escenario 17): el código de la extensión no contiene APIs capaces de
 * escribir, hacer clic, desplazar o enviar mensajes en WhatsApp Web.
 */
const SOURCE_ROOT = join(import.meta.dirname, "..");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return entry === "__fixtures__" ? [] : sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts") ? [path] : [];
  });
}

/** Prohibido en TODA la extensión. */
const FORBIDDEN_EVERYWHERE: readonly [string, RegExp][] = [
  ["dispatchEvent", /\bdispatchEvent\s*\(/],
  ["execCommand", /\bexecCommand\s*\(/],
  [
    "eventos sintéticos de teclado/entrada",
    /new\s+(KeyboardEvent|InputEvent|MouseEvent|ClipboardEvent)\b/,
  ],
  ["click programático", /\.click\s*\(/],
  ["desplazamiento programático", /\b(scrollIntoView|scrollTo|scrollBy)\s*\(|\.scrollTop\s*=/],
  ["innerHTML/outerHTML", /\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML/],
  ["eval/Function", /\beval\s*\(|new\s+Function\s*\(/],
];

/** Además prohibido en el lector de WhatsApp: cualquier mutación del DOM. */
const FORBIDDEN_IN_READER: readonly [string, RegExp][] = [
  [
    "mutación del DOM",
    /\.(append|appendChild|prepend|remove|removeChild|replaceWith|setAttribute|insertBefore)\s*\(/,
  ],
  ["asignación de texto o valor", /\.(textContent|innerText|value|nodeValue)\s*=/],
  ["foco", /\.focus\s*\(/],
];

describe("la extensión nunca escribe en WhatsApp", () => {
  const files = sourceFiles(SOURCE_ROOT);

  it("encuentra los archivos fuente a revisar", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(FORBIDDEN_EVERYWHERE)("no usa %s", (_label, pattern) => {
    const offenders = files.filter((file) => pattern.test(readFileSync(file, "utf8")));
    expect(offenders.map((file) => relative(SOURCE_ROOT, file))).toEqual([]);
  });

  it.each(FORBIDDEN_IN_READER)("el lector de WhatsApp no usa %s", (_label, pattern) => {
    const readerFiles = files.filter((file) => file.includes(join("content", "whatsapp")));
    expect(readerFiles.length).toBeGreaterThan(0);
    const offenders = readerFiles.filter((file) => pattern.test(readFileSync(file, "utf8")));
    expect(offenders.map((file) => relative(SOURCE_ROOT, file))).toEqual([]);
  });

  it("el manifiesto no pide permisos innecesarios", () => {
    const manifest = JSON.parse(
      readFileSync(join(SOURCE_ROOT, "..", "public", "manifest.json"), "utf8"),
    ) as {
      permissions: string[];
      host_permissions: string[];
    };
    expect(manifest.permissions).toEqual(["storage"]);
    expect(manifest.host_permissions).toEqual(["https://web.whatsapp.com/*"]);
  });
});
