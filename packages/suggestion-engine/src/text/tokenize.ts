import { normalizeText } from "@yigora/domain";

/** Abreviaturas frecuentes en chats (ya normalizadas). */
const ABBREVIATIONS: Readonly<Record<string, string>> = {
  xfa: "por favor",
  porfa: "por favor",
  pls: "please",
  plz: "please",
  thx: "thanks",
  q: "que",
  xq: "porque",
  pq: "porque",
  tb: "tambien",
  tmb: "tambien",
  vc: "voce",
  vcs: "voces",
  u: "you",
  svp: "s il vous plait",
};

/**
 * Normaliza un mensaje para comparar: sin tildes, minúsculas, sin signos, letras repetidas
 * colapsadas ("holaaa" → "hola") y abreviaturas expandidas.
 */
export function normalizeMessage(text: string): string {
  const base = normalizeText(text)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/(\p{L})\1{2,}/gu, "$1")
    .trim();
  return base
    .split(" ")
    .map((token) => ABBREVIATIONS[token] ?? token)
    .join(" ");
}

export function tokenize(normalized: string): string[] {
  return normalized.split(" ").filter((token) => token.length > 0);
}

/** Busca una frase completa (palabras enteras) dentro de un texto normalizado. */
export function containsPhrase(normalizedText: string, normalizedPhrase: string): boolean {
  return ` ${normalizedText} `.includes(` ${normalizedPhrase} `);
}
