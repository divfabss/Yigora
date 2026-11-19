import { describe, expect, it } from "vitest";
import { boundedLevenshtein, fuzzyTokenMatch } from "./fuzzy";
import { containsPhrase, normalizeMessage } from "./tokenize";

describe("normalizeMessage", () => {
  it("quita signos, tildes y letras repetidas", () => {
    expect(normalizeMessage("¡¡Holaaaa!! ¿Tienen Loratadína??")).toBe("hola tienen loratadina");
  });

  it("expande abreviaturas comunes", () => {
    expect(normalizeMessage("xfa q precio tiene")).toBe("por favor que precio tiene");
  });
});

describe("coincidencias", () => {
  it("tolera errores ortográficos en términos largos", () => {
    expect(fuzzyTokenMatch("loratadna", "loratadina")).toBe(true);
    expect(fuzzyTokenMatch("acetaminophen", "acetaminofen")).toBe(true);
    expect(fuzzyTokenMatch("ibuprofen", "ibuprofeno")).toBe(true);
  });

  it("exige coincidencia exacta en términos cortos", () => {
    expect(fuzzyTokenMatch("tas", "tos")).toBe(false);
    expect(fuzzyTokenMatch("tos", "tos")).toBe(true);
  });

  it("corta la distancia cuando supera el máximo", () => {
    expect(boundedLevenshtein("abcdef", "uvwxyz", 2)).toBe(3);
  });

  it("busca frases con palabras completas", () => {
    expect(containsPhrase("algo para el dolor de cabeza", "dolor de cabeza")).toBe(true);
    expect(containsPhrase("algo para el dolorde cabeza", "dolor de cabeza")).toBe(false);
  });
});
