import type { Intent, ProductSuggestion } from "../types";

const INTENT_LABELS_ES: Readonly<Record<Intent, string>> = {
  greeting: "Saludo",
  thanks: "Agradecimiento",
  price: "Consulta de precio",
  availability: "Consulta de disponibilidad",
  recommendation_by_need: "Busca un producto para una necesidad",
  product_info: "Consulta sobre uso o información del producto",
  other: "Consulta general",
};

/** Resumen en español de lo que pide el cliente, para el vendedor. */
export function summarizeForSeller(intent: Intent, products: readonly ProductSuggestion[]): string {
  const label = INTENT_LABELS_ES[intent];
  const terms = [...new Set(products.map((product) => product.matchedTerm))].slice(0, 3);
  return terms.length > 0 ? `${label}: ${terms.join(", ")}` : label;
}

function tipForProduct(product: ProductSuggestion): string {
  if (product.stock.availability === "out_of_stock") {
    return "Sin existencias: ofrezca una alternativa disponible o tome el pedido.";
  }
  if (product.stock.availability === "unknown") {
    return "Stock desconocido: verifique en bodega antes de confirmar.";
  }
  if (product.stock.isStale) {
    return "Inventario desactualizado: confirme la existencia antes de responder.";
  }
  return "Producto disponible: ofrezca apartarlo.";
}

/** Sugerencias comerciales en español para el vendedor (no se envían al cliente). */
export function sellerTips(intent: Intent, products: readonly ProductSuggestion[]): string[] {
  const [main] = products;
  if (!main) {
    return intent === "greeting" || intent === "thanks"
      ? ["Responda el saludo y pregunte en qué puede ayudar."]
      : ["Sin coincidencias en el inventario: pida más detalles al cliente."];
  }
  const tips = [tipForProduct(main)];
  if (products.some((product) => product.requiresPrescription === true)) {
    tips.push("Requiere receta: solicite la receta antes de confirmar la venta.");
  }
  if (intent === "recommendation_by_need") {
    tips.push("Recomendación por necesidad: valide la opción con el farmacéutico.");
  }
  return tips;
}
