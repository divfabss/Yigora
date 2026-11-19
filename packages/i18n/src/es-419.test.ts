import { describe, expect, it } from "vitest";
import { es419 } from "./es-419";

function collectStrings(value: unknown, path: string[] = []): Array<[string, string]> {
  if (typeof value === "string") {
    return [[path.join("."), value]];
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => collectStrings(child, [...path, key]));
  }
  throw new TypeError(`Valor no permitido en ${path.join(".")}`);
}

describe("catálogo es-419", () => {
  it("no contiene textos vacíos", () => {
    for (const [key, text] of collectStrings(es419)) {
      expect(text.trim(), key).not.toBe("");
    }
  });
});
