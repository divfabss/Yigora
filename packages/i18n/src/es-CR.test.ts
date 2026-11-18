import { describe, expect, it } from "vitest";
import { esCR } from "./es-CR";

function collectStrings(value: unknown, path: string[] = []): Array<[string, string]> {
  if (typeof value === "string") {
    return [[path.join("."), value]];
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => collectStrings(child, [...path, key]));
  }
  throw new TypeError(`Valor no permitido en ${path.join(".")}`);
}

describe("catálogo es-CR", () => {
  it("no contiene textos vacíos", () => {
    for (const [key, text] of collectStrings(esCR)) {
      expect(text.trim(), key).not.toBe("");
    }
  });
});
