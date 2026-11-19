import { describe, expect, it } from "vitest";
import { normalizeMessage, tokenize } from "../text/tokenize";
import { detectLanguage } from "./detect-language";

const detect = (text: string) => detectLanguage(text, tokenize(normalizeMessage(text))).language;

describe("detectLanguage", () => {
  it.each([
    ["es", "Buenas tardes, ¿tienen algo para la tos?"],
    ["es", "hola q tal, cuanto cuesta el ibuprofeno"],
    ["en", "Hi, how much is the ibuprofen?"],
    ["pt", "Oi, quanto custa o remédio?"],
    ["fr", "Bonjour, combien coûte ce médicament ?"],
    ["de", "Guten Tag, was kostet das?"],
    ["it", "Ciao, quanto costa il farmaco?"],
  ])("detecta %s", (language, text) => {
    expect(detect(text)).toBe(language);
  });

  it("no adivina cuando el mensaje no tiene evidencia suficiente", () => {
    expect(detect("ok")).toBeNull();
    expect(detect("👍")).toBeNull();
    expect(detect("10 mg")).toBeNull();
  });
});
