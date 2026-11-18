/**
 * Estado de inventario de un producto.
 *
 * Reglas (docs/DATABASE.md §2):
 * - Cantidad desconocida (null) es `unknown`; NUNCA se interpreta como 0.
 * - `isStale` indica información desactualizada y se combina con la disponibilidad.
 */
export type StockAvailability = "available" | "out_of_stock" | "unknown";

export interface StockStatus {
  readonly availability: StockAvailability;
  readonly isStale: boolean;
}

export interface StockSnapshot {
  readonly stockQuantity: number | null;
  readonly stockUpdatedAt: Date | null;
}

export interface StockStatusOptions {
  readonly staleAfterHours: number;
  readonly now: Date;
}

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

export function deriveStockAvailability(stockQuantity: number | null): StockAvailability {
  if (stockQuantity === null) {
    return "unknown";
  }
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new RangeError("stockQuantity must be a non-negative integer or null");
  }
  return stockQuantity === 0 ? "out_of_stock" : "available";
}

export function isStockInformationStale(
  stockUpdatedAt: Date | null,
  { staleAfterHours, now }: StockStatusOptions,
): boolean {
  if (stockUpdatedAt === null) {
    return true;
  }
  const ageInMilliseconds = now.getTime() - stockUpdatedAt.getTime();
  return ageInMilliseconds > staleAfterHours * MILLISECONDS_PER_HOUR;
}

export function deriveStockStatus(
  snapshot: StockSnapshot,
  options: StockStatusOptions,
): StockStatus {
  const availability = deriveStockAvailability(snapshot.stockQuantity);
  return {
    availability,
    // Si el stock es desconocido, "desactualizado" no aporta información adicional.
    isStale:
      availability !== "unknown" && isStockInformationStale(snapshot.stockUpdatedAt, options),
  };
}
