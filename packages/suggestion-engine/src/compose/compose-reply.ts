import type { Intent, ProductSuggestion } from "../types";
import type { ReplyTemplates } from "./templates";

export interface ComposeInput {
  readonly intent: Intent;
  readonly products: readonly ProductSuggestion[];
  readonly templates: ReplyTemplates;
  readonly formatProductPrice: (product: ProductSuggestion) => string | null;
}

const MAX_OPTIONS = 3;

function isConfirmedAvailable(product: ProductSuggestion): boolean {
  return product.stock.availability === "available" && !product.stock.isStale;
}

function describeAvailability(product: ProductSuggestion, input: ComposeInput): string {
  const { templates } = input;
  const price = input.formatProductPrice(product);
  if (product.stock.availability === "out_of_stock") {
    return templates.outOfStock(product.name);
  }
  if (product.stock.availability === "unknown") {
    return templates.unknownStock(product.name);
  }
  return product.stock.isStale
    ? templates.availableUnconfirmed(product.name, price)
    : templates.available(product.name, price);
}

function describeOption(product: ProductSuggestion, input: ComposeInput): string {
  const price = input.formatProductPrice(product);
  const details = [price];
  if (product.stock.availability === "out_of_stock") {
    details.push(input.templates.statusOutOfStock);
  } else if (!isConfirmedAvailable(product)) {
    details.push(input.templates.statusToConfirm);
  }
  const suffix = details.filter((detail): detail is string => detail !== null).join(", ");
  return suffix ? `• ${product.name} (${suffix})` : `• ${product.name}`;
}

function prescriptionNotes(
  products: readonly ProductSuggestion[],
  templates: ReplyTemplates,
): string[] {
  return products
    .filter((product) => product.requiresPrescription === true)
    .map((product) => templates.prescription(product.name));
}

function composeNeed(input: ComposeInput): string[] {
  const options = input.products.slice(0, MAX_OPTIONS);
  const lines = [
    input.templates.needIntro,
    ...options.map((product) => describeOption(product, input)),
  ];
  lines.push(...prescriptionNotes(options, input.templates), input.templates.pharmacistAdvice);
  return lines;
}

function composePrice(product: ProductSuggestion, input: ComposeInput): string[] {
  const price = input.formatProductPrice(product);
  const priceLine = price
    ? input.templates.priceOnly(product.name, price)
    : input.templates.priceUnknown(product.name);
  const lines = [priceLine];
  if (!isConfirmedAvailable(product)) {
    lines.push(describeAvailability(product, input));
  }
  return lines;
}

function composeSingleProduct(input: ComposeInput): string[] {
  const [main, ...others] = input.products;
  if (!main) {
    return [input.templates.notFound];
  }
  const lines =
    input.intent === "price" ? composePrice(main, input) : [describeAvailability(main, input)];
  const alternative = others.find(isConfirmedAvailable);
  if (!isConfirmedAvailable(main) && alternative) {
    lines.push(
      input.templates.alternative(alternative.name, input.formatProductPrice(alternative)),
    );
  }
  lines.push(...prescriptionNotes([main], input.templates));
  if (input.intent === "product_info") {
    lines.push(input.templates.usageAdvice);
  }
  if (isConfirmedAvailable(main) || alternative) {
    lines.push(input.templates.offerHold);
  }
  return lines;
}

/**
 * Compone la respuesta sugerida usando únicamente datos de los productos recuperados.
 * Nunca inventa precios, existencias ni indicaciones.
 */
export function composeReply(input: ComposeInput): string {
  if (input.products.length === 0) {
    const fixed: Partial<Record<Intent, string>> = {
      greeting: input.templates.greeting,
      thanks: input.templates.thanks,
      other: input.templates.clarify,
    };
    return fixed[input.intent] ?? input.templates.notFound;
  }
  const lines =
    input.intent === "recommendation_by_need" ? composeNeed(input) : composeSingleProduct(input);
  return lines.join(input.intent === "recommendation_by_need" ? "\n" : " ");
}
