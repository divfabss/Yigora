import { describe, expect, it } from "vitest";
import { normalizeText } from "./normalize-text";

describe("normalizeText", () => {
  it("elimina tildes, diacríticos y mayúsculas", () => {
    expect(normalizeText("Acetaminofén  Niños ")).toBe("acetaminofen ninos");
  });

  it("colapsa espacios internos y recorta extremos", () => {
    expect(normalizeText("  Loratadina\t10   mg ")).toBe("loratadina 10 mg");
  });

  it("conserva números y unidades", () => {
    expect(normalizeText("Ibuprofeno 400 MG")).toBe("ibuprofeno 400 mg");
  });
});
