import { createInMemoryProductSearch, createSuggestionEngine } from "@yigora/suggestion-engine";
import { describe, expect, it } from "vitest";
import { createDemoCatalog, DEMO_ORGANIZATION } from "./demo-pharmacy";

const now = new Date("2026-11-19T15:00:00Z");
const catalog = createDemoCatalog(now);
const engine = createSuggestionEngine({
  productSearch: createInMemoryProductSearch(catalog),
  now: () => now,
});
const ask = (text: string) =>
  engine.analyze({ messages: [{ direction: "incoming", text }] }, DEMO_ORGANIZATION);

describe("farmacia ficticia", () => {
  it("tiene como máximo 20 productos, todos rotulados como ficticios", () => {
    expect(catalog.length).toBeLessThanOrEqual(20);
    for (const product of catalog) {
      expect(product.description).toContain("ficticio");
    }
  });

  it("incluye los casos de inventario necesarios para la demo", () => {
    const quantities = catalog.map((product) => product.stockQuantity);
    expect(quantities).toContain(0);
    expect(quantities).toContain(null);
    expect(catalog.some((product) => product.requiresPrescription)).toBe(true);
  });

  it("no repite identificadores ni nombres", () => {
    expect(new Set(catalog.map((product) => product.id)).size).toBe(catalog.length);
    expect(new Set(catalog.map((product) => product.name)).size).toBe(catalog.length);
  });

  it.each([
    ["Hi! Do you have anything for allergies?", "Loratadina 10 mg"],
    ["tienen bloqueador?", "Protector solar FPS 50"],
    ["Do you sell sunscreen?", "Protector solar FPS 50"],
    ["Vocês têm algo para azia?", "Omeprazol 20 mg"],
    ["Haben Sie Pflaster?", "Curitas adhesivas surtidas"],
    ["avete un termometro?", "Termómetro digital"],
    ["necesito algo para la diarrea", "Suero oral sabor naranja 500 ml"],
  ])("encuentra productos para: %s", async (text, expected) => {
    const result = await ask(text);
    expect(result.products.map((product) => product.name)).toContain(expected);
  });
});
