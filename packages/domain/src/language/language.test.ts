import { describe, expect, it } from "vitest";
import { baseLanguage, isPriorityLanguage, languageCodeSchema } from "./language";

describe("idiomas", () => {
  it("valida códigos BCP-47 simples", () => {
    expect(languageCodeSchema.safeParse("es-CR").success).toBe(true);
    expect(languageCodeSchema.safeParse("de").success).toBe(true);
    expect(languageCodeSchema.safeParse("Spanish").success).toBe(false);
  });

  it("obtiene el idioma base", () => {
    expect(baseLanguage("pt-BR")).toBe("pt");
  });

  it("reconoce los idiomas prioritarios", () => {
    expect(isPriorityLanguage("fr")).toBe(true);
    expect(isPriorityLanguage("ja")).toBe(false);
  });
});
