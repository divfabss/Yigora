/**
 * @yigora/suggestion-engine — motor de sugerencias independiente del proveedor de IA.
 * No accede a red ni BD: recibe sus dependencias mediante puertos.
 */
export {
  createSuggestionEngine,
  type SuggestionEngine,
  type SuggestionEngineDependencies,
} from "./engine";
export { createInMemoryProductSearch } from "./catalog/in-memory-product-search";
export { detectLanguage } from "./language/detect-language";
export { normalizeMessage, tokenize } from "./text/tokenize";
export { findUngroundedNumbers, isGrounded } from "./validate/grounding";
export { formatPrice } from "./compose/format-price";
export type * from "./types";
