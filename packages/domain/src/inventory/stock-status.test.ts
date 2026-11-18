import { describe, expect, it } from "vitest";
import { deriveStockAvailability, deriveStockStatus } from "./stock-status";

const now = new Date("2026-11-18T12:00:00Z");
const options = { staleAfterHours: 24, now };

describe("deriveStockAvailability", () => {
  it("trata null como desconocido, nunca como cero", () => {
    expect(deriveStockAvailability(null)).toBe("unknown");
  });

  it("distingue sin existencias de disponible", () => {
    expect(deriveStockAvailability(0)).toBe("out_of_stock");
    expect(deriveStockAvailability(12)).toBe("available");
  });

  it("rechaza cantidades negativas o no enteras", () => {
    expect(() => deriveStockAvailability(-1)).toThrow(RangeError);
    expect(() => deriveStockAvailability(1.5)).toThrow(RangeError);
  });
});

describe("deriveStockStatus", () => {
  it("marca como desactualizado cuando supera el umbral", () => {
    const status = deriveStockStatus(
      { stockQuantity: 5, stockUpdatedAt: new Date("2026-11-17T11:59:59Z") },
      options,
    );
    expect(status).toEqual({ availability: "available", isStale: true });
  });

  it("no marca desactualizado dentro del umbral", () => {
    const status = deriveStockStatus(
      { stockQuantity: 0, stockUpdatedAt: new Date("2026-11-18T08:00:00Z") },
      options,
    );
    expect(status).toEqual({ availability: "out_of_stock", isStale: false });
  });

  it("considera desactualizado un stock sin fecha de actualización", () => {
    expect(deriveStockStatus({ stockQuantity: 3, stockUpdatedAt: null }, options).isStale).toBe(
      true,
    );
  });

  it("no agrega desactualizado a un stock desconocido", () => {
    expect(deriveStockStatus({ stockQuantity: null, stockUpdatedAt: null }, options)).toEqual({
      availability: "unknown",
      isStale: false,
    });
  });
});
