import { describe, expect, it } from "vitest";
import { productInputSchema } from "./product";

const base = { name: "Loratadina 10 mg", stockQuantity: 12, price: 2500 };

describe("productInputSchema", () => {
  it("acepta un producto válido y aplica CRC por defecto", () => {
    const result = productInputSchema.parse(base);
    expect(result.currency).toBe("CRC");
  });

  it("acepta stock desconocido (null) sin convertirlo a cero", () => {
    expect(productInputSchema.parse({ ...base, stockQuantity: null }).stockQuantity).toBeNull();
  });

  it("rechaza cantidades negativas", () => {
    expect(productInputSchema.safeParse({ ...base, stockQuantity: -3 }).success).toBe(false);
  });

  it("rechaza precios negativos o con más de dos decimales", () => {
    expect(productInputSchema.safeParse({ ...base, price: -1 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, price: 10.555 }).success).toBe(false);
    expect(productInputSchema.safeParse({ ...base, price: 10.55 }).success).toBe(true);
  });

  it("rechaza nombres vacíos y convierte textos opcionales vacíos en null", () => {
    expect(productInputSchema.safeParse({ ...base, name: "   " }).success).toBe(false);
    expect(productInputSchema.parse({ ...base, description: "  " }).description).toBeNull();
  });
});
