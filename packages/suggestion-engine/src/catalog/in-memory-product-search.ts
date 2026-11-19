import { containsPhrase, normalizeMessage, tokenize } from "../text/tokenize";
import { fuzzyTokenMatch } from "../text/fuzzy";
import type {
  CatalogKeyword,
  CatalogProduct,
  ProductMatch,
  ProductSearchPort,
  ProductSearchQuery,
} from "../types";

const MINIMUM_SCORE = 0.5;
const KEYWORD_SCORE: Readonly<Record<CatalogKeyword["kind"], number>> = {
  active_ingredient: 0.95,
  brand: 0.95,
  synonym: 0.9,
  indication: 0.8,
};

/** Palabras del nombre que no identifican al producto (unidades, conectores). */
const NON_DISTINCTIVE = new Set([
  "mg",
  "ml",
  "g",
  "fps",
  "spf",
  "para",
  "de",
  "la",
  "el",
  "los",
  "las",
  "con",
  "sin",
  "y",
  "sabor",
  "en",
  "x",
]);

interface IndexedProduct {
  readonly product: CatalogProduct;
  readonly nameTokens: readonly string[];
  readonly keywords: readonly {
    readonly normalized: string;
    readonly kind: CatalogKeyword["kind"];
    readonly original: string;
  }[];
}

function distinctiveNameTokens(name: string): string[] {
  return tokenize(normalizeMessage(name)).filter(
    (token) => !NON_DISTINCTIVE.has(token) && !/^\d+$/.test(token) && token.length >= 3,
  );
}

function indexProduct(product: CatalogProduct): IndexedProduct {
  return {
    product,
    nameTokens: distinctiveNameTokens(product.name),
    keywords: product.keywords.map((keyword) => ({
      normalized: normalizeMessage(keyword.keyword),
      kind: keyword.kind,
      original: keyword.keyword,
    })),
  };
}

/** El primer término del nombre (el genérico) pesa el doble. */
function scoreByName(indexed: IndexedProduct, tokens: readonly string[]): number {
  const [primary, ...rest] = indexed.nameTokens;
  if (!primary) {
    return 0;
  }
  const matches = (term: string) => tokens.some((token) => fuzzyTokenMatch(token, term));
  const primaryWeight = matches(primary) ? 2 : 0;
  const restWeight = rest.filter(matches).length;
  return (primaryWeight + restWeight) / (2 + rest.length);
}

function bestKeywordMatch(
  indexed: IndexedProduct,
  query: ProductSearchQuery,
): { score: number; term: string } | null {
  let best: { score: number; term: string } | null = null;
  for (const keyword of indexed.keywords) {
    const isPhrase = keyword.normalized.includes(" ");
    const found = isPhrase
      ? containsPhrase(query.normalizedText, keyword.normalized)
      : query.tokens.some((token) => fuzzyTokenMatch(token, keyword.normalized));
    const score = KEYWORD_SCORE[keyword.kind];
    if (found && (!best || score > best.score)) {
      best = { score, term: keyword.original };
    }
  }
  return best;
}

function matchProduct(indexed: IndexedProduct, query: ProductSearchQuery): ProductMatch | null {
  const nameScore = scoreByName(indexed, query.tokens);
  const keyword = bestKeywordMatch(indexed, query);
  // Si el cliente nombró el producto, eso prevalece sobre una coincidencia por indicación.
  if (nameScore >= MINIMUM_SCORE) {
    const score = Math.max(nameScore, keyword?.score ?? 0);
    return {
      product: indexed.product,
      score,
      matchedBy: "name",
      matchedTerm: indexed.product.name,
    };
  }
  if (keyword && keyword.score >= MINIMUM_SCORE) {
    return {
      product: indexed.product,
      score: keyword.score,
      matchedBy: "keyword",
      matchedTerm: keyword.term,
    };
  }
  return null;
}

/**
 * Búsqueda en memoria sobre un catálogo pequeño (modo demostración y pruebas).
 * En producción se reemplaza por un adaptador a la RPC `search_products` de Supabase.
 */
export function createInMemoryProductSearch(catalog: readonly CatalogProduct[]): ProductSearchPort {
  const indexed = catalog.map(indexProduct);
  return {
    search(query) {
      const results = indexed
        .map((item) => matchProduct(item, query))
        .filter((match): match is ProductMatch => match !== null)
        .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
        .slice(0, query.limit);
      return Promise.resolve(results);
    },
  };
}
