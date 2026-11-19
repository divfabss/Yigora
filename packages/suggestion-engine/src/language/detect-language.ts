import type { LanguageDetection } from "../types";
import { CHARACTER_HINTS, LANGUAGE_LEXICON } from "./lexicon";

const CHARACTER_HINT_WEIGHT = 1.5;
const MINIMUM_SCORE = 1;
const MINIMUM_MARGIN = 1.4;

/** Cuántos idiomas contienen cada palabra: las palabras compartidas aportan menos. */
const WORD_LANGUAGES: ReadonlyMap<string, readonly string[]> = buildWordIndex();

function buildWordIndex(): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const [language, words] of Object.entries(LANGUAGE_LEXICON)) {
    for (const word of words) {
      index.set(word, [...(index.get(word) ?? []), language]);
    }
  }
  return index;
}

function scoreLanguages(rawText: string, tokens: readonly string[]): Map<string, number> {
  const scores = new Map<string, number>();
  const add = (language: string, value: number) => {
    scores.set(language, (scores.get(language) ?? 0) + value);
  };
  for (const token of tokens) {
    const languages = WORD_LANGUAGES.get(token) ?? [];
    for (const language of languages) {
      add(language, 1 / languages.length);
    }
  }
  for (const [language, pattern] of Object.entries(CHARACTER_HINTS)) {
    if (pattern.test(rawText)) {
      add(language, CHARACTER_HINT_WEIGHT);
    }
  }
  return scores;
}

/**
 * Detecta el idioma con un léxico por idioma. Pensado para mensajes cortos de chat;
 * devuelve `language: null` cuando la evidencia no es suficiente.
 */
export function detectLanguage(rawText: string, tokens: readonly string[]): LanguageDetection {
  const ranked = [...scoreLanguages(rawText, tokens).entries()].sort((a, b) => b[1] - a[1]);
  const [best, second] = ranked;
  if (!best || best[1] < MINIMUM_SCORE) {
    return { language: null, confidence: 0 };
  }
  const secondScore = second?.[1] ?? 0;
  if (secondScore > 0 && best[1] / secondScore < MINIMUM_MARGIN) {
    return { language: null, confidence: 0 };
  }
  const total = ranked.reduce((sum, [, score]) => sum + score, 0);
  return { language: best[0], confidence: Math.round((best[1] / total) * 100) / 100 };
}
