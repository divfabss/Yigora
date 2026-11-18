import { z } from "zod";

const MAX_PRICE = 9_999_999_999.99;

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable();

/** Cantidad en stock: entero ≥ 0, o null cuando es desconocida (nunca 0 por defecto). */
export const stockQuantitySchema = z.number().int().nonnegative().max(2_147_483_647).nullable();

/** Precio con máximo dos decimales; null = sin precio registrado. */
export const priceSchema = z
  .number()
  .nonnegative()
  .max(MAX_PRICE)
  .refine(hasAtMostTwoDecimals, { message: "El precio admite como máximo dos decimales" })
  .nullable();

export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);

/** Datos editables de un producto (alta manual o edición desde el dashboard). */
export const productInputSchema = z.object({
  sku: optionalText(64).optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  description: optionalText(2000).optional(),
  usageRecommendations: optionalText(2000).optional(),
  stockQuantity: stockQuantitySchema,
  price: priceSchema,
  currency: currencyCodeSchema.default("CRC"),
  requiresPrescription: z.boolean().nullable().optional(),
});
export type ProductInput = z.infer<typeof productInputSchema>;

/** Producto tal como lo expone el API (camelCase). */
export const productSchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  sku: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  usageRecommendations: z.string().nullable(),
  stockQuantity: stockQuantitySchema,
  stockUpdatedAt: z.coerce.date().nullable(),
  price: z.number().nonnegative().nullable(),
  currency: currencyCodeSchema,
  requiresPrescription: z.boolean().nullable(),
  isActive: z.boolean(),
  isDemoData: z.boolean(),
  updatedAt: z.coerce.date(),
});
export type Product = z.infer<typeof productSchema>;

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(Math.round(value * 100) - value * 100) < 1e-6;
}
