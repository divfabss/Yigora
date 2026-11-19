import { describe, expect, it } from "vitest";
import { FIXTURE_CATALOG, FIXTURE_NOW } from "./__fixtures__/catalog";
import { createInMemoryProductSearch } from "./catalog/in-memory-product-search";
import { createSuggestionEngine } from "./engine";
import type { ConversationMessage, SuggestionRequest } from "./types";

const engine = createSuggestionEngine({
  productSearch: createInMemoryProductSearch(FIXTURE_CATALOG),
  now: () => FIXTURE_NOW,
});
const organization = { defaultLanguage: "es", staleAfterHours: 24 };
const incoming = (text: string): ConversationMessage => ({ direction: "incoming", text });
const outgoing = (text: string): ConversationMessage => ({ direction: "outgoing", text });
const analyze = (messages: ConversationMessage[], extra: Partial<SuggestionRequest> = {}) =>
  engine.analyze({ messages, ...extra }, organization);

describe("motor de sugerencias", () => {
  it("resuelve el ejemplo del cliente en inglés que busca algo para alergias", async () => {
    const result = await analyze([incoming("Hi! Do you have anything for allergies?")]);
    expect(result.detectedLanguage).toBe("en");
    expect(result.replyLanguage).toBe("en");
    expect(result.intent).toBe("recommendation_by_need");
    // A igual relevancia, el producto con existencias va primero (Cetirizina está agotada).
    expect(result.products.map((product) => product.name)).toEqual([
      "Loratadina 10 mg",
      "Cetirizina 10 mg",
    ]);
    expect(result.reply).toContain("For that, we have these options:");
    // El nombre se conserva tal como está en la BD (no se traduce).
    expect(result.reply).toContain("Loratadina 10 mg");
    expect(result.summaryEs).toContain("Busca un producto para una necesidad");
  });

  it("tolera errores ortográficos en español", async () => {
    const result = await analyze([incoming("buenas, tienen loratadna??")]);
    expect(result.detectedLanguage).toBe("es");
    expect(result.intent).toBe("availability");
    expect(result.products[0]?.name).toBe("Loratadina 10 mg");
    expect(result.reply).toMatch(
      /^Sí, tenemos Loratadina 10 mg disponible a ₡\s?2[.,\s\u00a0]?500\./u,
    );
    expect(result.reply).toContain("¿Desea que se lo apartemos?");
  });

  it("informa productos sin stock y sugiere vender otra cosa al vendedor", async () => {
    const result = await analyze([incoming("tienen cetirizina?")]);
    expect(result.products[0]?.stock.availability).toBe("out_of_stock");
    expect(result.reply).toContain("En este momento no tenemos Cetirizina 10 mg en existencia.");
    expect(result.sellerTipsEs[0]).toContain("Sin existencias");
  });

  it("ofrece una alternativa disponible cuando el producto principal está agotado", async () => {
    const result = await analyze([incoming("tienen cetirizina para la alergia?")]);
    expect(result.reply).toContain("Como alternativa tenemos Loratadina 10 mg");
  });

  it("nunca trata el stock desconocido como cero", async () => {
    const result = await analyze([incoming("¿Tienen suero oral?")]);
    expect(result.products[0]?.stock.availability).toBe("unknown");
    expect(result.reply).toBe(
      "Permítame verificar si tenemos Suero oral sabor naranja disponible.",
    );
    expect(result.sellerTipsEs[0]).toContain("Stock desconocido");
  });

  it("pide confirmar cuando el inventario está desactualizado", async () => {
    const result = await analyze([incoming("tienen jarabe para la tos?")]);
    expect(result.products[0]?.stock).toEqual({ availability: "available", isStale: true });
    expect(result.reply).toContain("permítame confirmar la disponibilidad");
    expect(result.sellerTipsEs[0]).toContain("desactualizado");
  });

  it("advierte cuando el producto requiere receta", async () => {
    const result = await analyze([incoming("Hola, tienen amoxicilina?")]);
    expect(result.reply).toContain("Amoxicilina 500 mg requiere receta médica.");
    expect(result.sellerTipsEs).toContain(
      "Requiere receta: solicite la receta antes de confirmar la venta.",
    );
  });

  it("responde con honestidad ante un producto inexistente", async () => {
    const result = await analyze([incoming("tienen insulina glargina?")]);
    expect(result.products).toEqual([]);
    expect(result.reply).toContain("no encontramos ese producto");
    expect(result.sellerTipsEs[0]).toContain("Sin coincidencias");
  });

  it("responde consultas de precio", async () => {
    const result = await analyze([incoming("cuánto cuesta el ibuprofeno?")]);
    expect(result.intent).toBe("price");
    expect(result.reply).toMatch(/^Ibuprofeno 400 mg tiene un precio de ₡\s?2[.,\s\u00a0]?200\./u);
  });

  it.each([
    [
      "pt",
      "Olá, vocês têm algo para dor de cabeça?",
      "Para isso, temos estas opções:",
      "Acetaminofén 500 mg",
    ],
    [
      "fr",
      "Bonjour, avez-vous quelque chose contre la toux ?",
      "Pour cela, nous avons ces options :",
      "Jarabe para la tos sin azúcar",
    ],
    [
      "de",
      "Hallo, haben Sie etwas gegen Halsschmerzen?",
      "Dafür haben wir folgende Möglichkeiten:",
      "Pastillas para la garganta miel y limón",
    ],
    [
      "it",
      "Buongiorno, avete qualcosa per il mal di gola?",
      "Per questo abbiamo queste opzioni:",
      "Pastillas para la garganta miel y limón",
    ],
  ])("detecta %s y responde en ese idioma", async (language, text, intro, productName) => {
    const result = await analyze([incoming(text)]);
    expect(result.detectedLanguage).toBe(language);
    expect(result.reply).toContain(intro);
    expect(result.reply).toContain(productName);
  });

  it("permite elegir manualmente el idioma de la respuesta", async () => {
    const result = await analyze([incoming("tienen ibuprofeno?")], { replyLanguage: "en" });
    expect(result.detectedLanguage).toBe("es");
    expect(result.reply).toMatch(/^Yes, we have Ibuprofeno 400 mg available for/);
  });

  it("usa el contexto de mensajes anteriores para mensajes muy cortos", async () => {
    const result = await analyze([
      incoming("Hello, I need something for a headache"),
      outgoing("Claro"),
      incoming("ok 2"),
    ]);
    expect(result.detectedLanguage).toBe("en");
  });

  it("responde saludos y agradecimientos sin inventar productos", async () => {
    expect((await analyze([incoming("Holaaa buenas tardes")])).intent).toBe("greeting");
    const thanks = await analyze([incoming("Muchas gracias!")]);
    expect(thanks.intent).toBe("thanks");
    expect(thanks.reply).toBe("¡Con mucho gusto! Estamos para servirle.");
  });

  it("indica cuando no hay mensajes del cliente", async () => {
    const result = await analyze([outgoing("Buenos días, ¿en qué le ayudamos?")]);
    expect(result.status).toBe("no_customer_message");
    expect(result.reply).toBe("");
  });

  it("marca cuando el vendedor ya respondió el último mensaje", async () => {
    const result = await analyze([incoming("tienen ibuprofeno?"), outgoing("Sí, tenemos")]);
    expect(result.awaitingCustomer).toBe(true);
    expect(result.customerText).toBe("tienen ibuprofeno?");
  });

  it("relaciona preguntas de seguimiento con el producto mencionado antes", async () => {
    const result = await analyze([
      incoming("Buenas! tienen ibuprofeno?"),
      outgoing("Hola, con gusto le ayudo"),
      incoming("y cuanto cuesta?"),
    ]);
    expect(result.intent).toBe("price");
    expect(result.customerText).toBe("y cuanto cuesta?");
    expect(result.reply).toMatch(/^Ibuprofeno 400 mg tiene un precio de/);
  });

  it("nunca usa IA en el modo determinista", async () => {
    expect((await analyze([incoming("tienen ibuprofeno?")])).usedAi).toBe(false);
  });
});
