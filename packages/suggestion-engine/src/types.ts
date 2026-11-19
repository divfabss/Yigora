import type { StockStatus } from "@yigora/domain";

export type MessageDirection = "incoming" | "outgoing";

/** Mensaje de la conversación. Solo texto y dirección: sin nombres, teléfonos ni metadatos. */
export interface ConversationMessage {
  readonly direction: MessageDirection;
  readonly text: string;
}

export type KeywordKind = "synonym" | "brand" | "active_ingredient" | "indication";

export interface CatalogKeyword {
  readonly keyword: string;
  readonly language: string;
  readonly kind: KeywordKind;
}

/** Producto tal como lo necesita el motor. Toda la información comercial viene de la BD. */
export interface CatalogProduct {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly usageRecommendations: string | null;
  readonly stockQuantity: number | null;
  readonly stockUpdatedAt: Date | null;
  readonly price: number | null;
  readonly currency: string;
  readonly requiresPrescription: boolean | null;
  readonly keywords: readonly CatalogKeyword[];
}

export interface ProductMatch {
  readonly product: CatalogProduct;
  readonly score: number;
  readonly matchedBy: "name" | "keyword";
  readonly matchedTerm: string;
}

export interface ProductSearchQuery {
  readonly normalizedText: string;
  readonly tokens: readonly string[];
  readonly limit: number;
}

/** Puerto de búsqueda de productos (en memoria para la demo; Supabase RPC en producción). */
export interface ProductSearchPort {
  search(query: ProductSearchQuery): Promise<readonly ProductMatch[]>;
}

export type Intent =
  | "greeting"
  | "thanks"
  | "price"
  | "availability"
  | "recommendation_by_need"
  | "product_info"
  | "other";

export interface LanguageDetection {
  /** Código de idioma detectado, o null si no hay evidencia suficiente. */
  readonly language: string | null;
  /** 0–1. */
  readonly confidence: number;
}

export interface OrganizationContext {
  /** Idioma por defecto si no se puede detectar el del cliente. */
  readonly defaultLanguage: string;
  readonly staleAfterHours: number;
}

export interface SuggestionRequest {
  readonly messages: readonly ConversationMessage[];
  /** Idioma de respuesta elegido por el vendedor; por defecto, el detectado. */
  readonly replyLanguage?: string;
}

export interface ProductSuggestion {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly usageRecommendations: string | null;
  readonly price: number | null;
  readonly currency: string;
  readonly stockQuantity: number | null;
  readonly stock: StockStatus;
  readonly requiresPrescription: boolean | null;
  readonly matchedTerm: string;
}

export interface SuggestionResult {
  readonly status: "ok" | "no_customer_message";
  /** Verdadero si el último mensaje es del vendedor (el cliente aún no responde). */
  readonly awaitingCustomer: boolean;
  readonly customerText: string;
  readonly detectedLanguage: string | null;
  readonly languageConfidence: number;
  readonly replyLanguage: string;
  readonly intent: Intent;
  /** Resumen de la consulta en español para el vendedor. */
  readonly summaryEs: string;
  /** Traducción al español; null si no hay traductor disponible o el mensaje ya está en español. */
  readonly translationEs: string | null;
  readonly products: readonly ProductSuggestion[];
  readonly sellerTipsEs: readonly string[];
  readonly reply: string;
  readonly usedAi: boolean;
}
