import { formatPrice } from "@yigora/suggestion-engine";

/** Precio para el vendedor, en español latinoamericano. */
export const formatSellerPrice = (amount: number, currency: string): string =>
  formatPrice(amount, currency, "es-419");
