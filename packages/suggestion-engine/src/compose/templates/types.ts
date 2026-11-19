/**
 * Plantillas de respuesta por idioma. Solo reciben datos ya verificados de la BD
 * (nombre del producto tal como está registrado y precio formateado).
 */
export interface ReplyTemplates {
  readonly greeting: string;
  /** Saludo breve que antecede la respuesta cuando el cliente saludó. */
  readonly greetingPrefix: string;
  readonly thanks: string;
  readonly clarify: string;
  readonly notFound: string;
  available(name: string, price: string | null): string;
  availableUnconfirmed(name: string, price: string | null): string;
  outOfStock(name: string): string;
  unknownStock(name: string): string;
  priceOnly(name: string, price: string): string;
  priceUnknown(name: string): string;
  readonly needIntro: string;
  alternative(name: string, price: string | null): string;
  prescription(name: string): string;
  readonly offerHold: string;
  readonly pharmacistAdvice: string;
  readonly usageAdvice: string;
  readonly statusToConfirm: string;
  readonly statusOutOfStock: string;
}

export const withPrice = (prefix: string, price: string | null): string =>
  price ? `${prefix}${price}` : "";

export const inParentheses = (price: string | null): string => (price ? ` (${price})` : "");
