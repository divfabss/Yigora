import { containsPhrase } from "../text/tokenize";
import type { Intent, ProductMatch } from "../types";
import { INTENT_PHRASES } from "./intent-lexicon";

type SignalIntent = keyof typeof INTENT_PHRASES;

function detectSignals(normalizedText: string): ReadonlySet<SignalIntent> {
  const signals = new Set<SignalIntent>();
  for (const [intent, phrases] of Object.entries(INTENT_PHRASES) as [
    SignalIntent,
    readonly string[],
  ][]) {
    if (phrases.some((phrase) => containsPhrase(normalizedText, phrase))) {
      signals.add(intent);
    }
  }
  return signals;
}

function classifyProductQuestion(
  signals: ReadonlySet<SignalIntent>,
  matches: readonly ProductMatch[],
): Intent | null {
  const namedProduct = matches.some((match) => match.matchedBy === "name");
  const needMatched = matches.some((match) => match.matchedBy === "keyword");
  if (signals.has("recommendation_by_need") || (!namedProduct && needMatched)) {
    return "recommendation_by_need";
  }
  if (signals.has("availability") || namedProduct) {
    return "availability";
  }
  return null;
}

/**
 * Clasifica la intención principal del cliente combinando frases clave y productos encontrados.
 * Orden de prioridad: precio > información de uso > necesidad/disponibilidad > agradecimiento > saludo.
 */
export function classifyIntent(normalizedText: string, matches: readonly ProductMatch[]): Intent {
  const signals = detectSignals(normalizedText);
  if (signals.has("price")) {
    return "price";
  }
  if (signals.has("product_info")) {
    return "product_info";
  }
  const productIntent = classifyProductQuestion(signals, matches);
  if (productIntent) {
    return productIntent;
  }
  if (signals.has("thanks")) {
    return "thanks";
  }
  return signals.has("greeting") ? "greeting" : "other";
}
