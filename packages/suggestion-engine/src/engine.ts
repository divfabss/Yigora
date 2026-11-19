import { deriveStockStatus, isPriorityLanguage, type PriorityLanguage } from "@yigora/domain";
import { composeReply } from "./compose/compose-reply";
import { formatPrice } from "./compose/format-price";
import { sellerTips, summarizeForSeller } from "./compose/seller-summary";
import { NUMBER_LOCALES, REPLY_TEMPLATES } from "./compose/templates";
import { extractCustomerTurn } from "./conversation";
import { classifyIntent } from "./intent/classify-intent";
import { detectLanguage } from "./language/detect-language";
import { normalizeMessage, tokenize } from "./text/tokenize";
import type {
  ConversationMessage,
  LanguageDetection,
  OrganizationContext,
  ProductMatch,
  ProductSearchPort,
  ProductSuggestion,
  SuggestionRequest,
  SuggestionResult,
} from "./types";
import { isGrounded } from "./validate/grounding";

const MAX_PRODUCTS = 5;

export interface SuggestionEngineDependencies {
  readonly productSearch: ProductSearchPort;
  readonly now?: () => Date;
}

function detectWithContext(text: string, contextTexts: readonly string[]): LanguageDetection {
  const direct = detectLanguage(text, tokenize(normalizeMessage(text)));
  if (direct.language !== null || contextTexts.length === 0) {
    return direct;
  }
  const combined = [...contextTexts, text].join(" ");
  const fromContext = detectLanguage(combined, tokenize(normalizeMessage(combined)));
  return { language: fromContext.language, confidence: fromContext.confidence * 0.8 };
}

function resolveReplyLanguage(
  requested: string | undefined,
  detected: string | null,
  organization: OrganizationContext,
): PriorityLanguage {
  const candidates = [requested, detected, organization.defaultLanguage];
  const supported = candidates.find(
    (code): code is PriorityLanguage =>
      code !== undefined && code !== null && isPriorityLanguage(code),
  );
  return supported ?? "es";
}

function toSuggestion(
  match: ProductMatch,
  organization: OrganizationContext,
  now: Date,
): ProductSuggestion {
  const { product } = match;
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    usageRecommendations: product.usageRecommendations,
    price: product.price,
    currency: product.currency,
    stockQuantity: product.stockQuantity,
    stock: deriveStockStatus(product, { staleAfterHours: organization.staleAfterHours, now }),
    requiresPrescription: product.requiresPrescription,
    matchedTerm: match.matchedTerm,
  };
}

const AVAILABILITY_RANK: Readonly<Record<string, number>> = {
  available: 0,
  stale: 1,
  unknown: 2,
  out_of_stock: 3,
};

const availabilityRank = (product: ProductSuggestion): number =>
  AVAILABILITY_RANK[product.stock.isStale ? "stale" : product.stock.availability] ?? 3;

/** Ordena por relevancia; a igual relevancia, primero los productos con existencias confirmadas. */
function rankProducts(
  matches: readonly ProductMatch[],
  organization: OrganizationContext,
  now: Date,
): ProductSuggestion[] {
  return matches
    .map((match) => ({ score: match.score, product: toSuggestion(match, organization, now) }))
    .sort((a, b) => b.score - a.score || availabilityRank(a.product) - availabilityRank(b.product))
    .map(({ product }) => product);
}

function emptyResult(replyLanguage: PriorityLanguage): SuggestionResult {
  return {
    status: "no_customer_message",
    awaitingCustomer: false,
    customerText: "",
    detectedLanguage: null,
    languageConfidence: 0,
    replyLanguage,
    intent: "other",
    summaryEs: "Aún no hay mensajes del cliente hoy",
    translationEs: null,
    products: [],
    sellerTipsEs: [],
    reply: "",
    usedAi: false,
  };
}

/**
 * Motor de sugerencias determinista (sin IA). Orquesta: turno del cliente → normalización →
 * idioma → búsqueda → intención → respuesta → validación de veracidad.
 */
export function createSuggestionEngine({
  productSearch,
  now = () => new Date(),
}: SuggestionEngineDependencies) {
  /**
   * Preguntas de seguimiento ("¿y cuánto cuesta?"): si el turno actual no nombra productos,
   * se buscan en los mensajes anteriores del cliente (del más reciente al más antiguo).
   */
  async function searchInContext(
    context: readonly ConversationMessage[],
  ): Promise<readonly ProductMatch[]> {
    for (const message of [...context].reverse()) {
      const normalized = normalizeMessage(message.text);
      const found = await productSearch.search({
        normalizedText: normalized,
        tokens: tokenize(normalized),
        limit: MAX_PRODUCTS,
      });
      if (found.length > 0) {
        return found;
      }
    }
    return [];
  }

  async function analyze(
    request: SuggestionRequest,
    organization: OrganizationContext,
  ): Promise<SuggestionResult> {
    const turn = extractCustomerTurn(request.messages);
    if (turn.messages.length === 0) {
      return emptyResult(resolveReplyLanguage(request.replyLanguage, null, organization));
    }
    const customerText = turn.messages.map((message) => message.text.trim()).join("\n");
    const normalizedText = normalizeMessage(customerText);
    const tokens = tokenize(normalizedText);
    const detection = detectWithContext(
      customerText,
      turn.context.map((message) => message.text),
    );
    const direct = await productSearch.search({ normalizedText, tokens, limit: MAX_PRODUCTS });
    const intent = classifyIntent(normalizedText, direct);
    const matches = direct.length > 0 ? direct : await searchInContext(turn.context);
    const replyLanguage = resolveReplyLanguage(
      request.replyLanguage,
      detection.language,
      organization,
    );
    const products = rankProducts(matches, organization, now());
    const locale = NUMBER_LOCALES[replyLanguage];
    const formatProductPrice = (product: ProductSuggestion) =>
      product.price === null ? null : formatPrice(product.price, product.currency, locale);
    const templates = REPLY_TEMPLATES[replyLanguage];
    const composed = composeReply({ intent, products, templates, formatProductPrice });
    const sources = products.flatMap((product) => [
      product.name,
      formatProductPrice(product) ?? "",
    ]);
    return {
      status: "ok",
      awaitingCustomer: turn.awaitingCustomer,
      customerText,
      detectedLanguage: detection.language,
      languageConfidence: detection.confidence,
      replyLanguage,
      intent,
      summaryEs: summarizeForSeller(intent, products),
      translationEs: null,
      products,
      sellerTipsEs: sellerTips(intent, products),
      reply: isGrounded(composed, sources) ? composed : templates.clarify,
      usedAi: false,
    };
  }

  return { analyze };
}

export type SuggestionEngine = ReturnType<typeof createSuggestionEngine>;
