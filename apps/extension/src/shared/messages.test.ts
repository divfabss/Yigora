import { describe, expect, it } from "vitest";
import { contentMessageSchema, overlayMessageSchema } from "./messages";

describe("contratos de mensajería", () => {
  it("acepta una instantánea válida del chat", () => {
    const message = {
      type: "reader.snapshot",
      sessionId: "abcdefgh12345678",
      snapshot: { chatKey: "a1b2c3d4", messages: [{ direction: "incoming", text: "Hola" }] },
      diagnostics: { panelFound: true, messageNodes: 1, withDate: 1, today: 1, dateSample: null },
    };
    expect(contentMessageSchema.safeParse(message).success).toBe(true);
  });

  it("rechaza campos inesperados como nombres o teléfonos en lugar del hash", () => {
    const message = {
      type: "reader.snapshot",
      sessionId: "abcdefgh12345678",
      snapshot: { chatKey: "María +506 8888-8888", messages: [] },
    };
    expect(contentMessageSchema.safeParse(message).success).toBe(false);
  });

  it("limita la cantidad y longitud de mensajes", () => {
    const tooMany = Array.from({ length: 21 }, () => ({ direction: "incoming", text: "x" }));
    expect(
      contentMessageSchema.safeParse({
        type: "reader.snapshot",
        sessionId: "abcdefgh12345678",
        snapshot: { chatKey: "a1b2c3d4", messages: tooMany },
      }).success,
    ).toBe(false);
    expect(
      overlayMessageSchema.safeParse({ type: "analyze.manual", text: "x".repeat(2001) }).success,
    ).toBe(false);
  });

  it("solo permite los idiomas de respuesta soportados", () => {
    expect(overlayMessageSchema.safeParse({ type: "reply.language", language: "en" }).success).toBe(
      true,
    );
    expect(overlayMessageSchema.safeParse({ type: "reply.language", language: "xx" }).success).toBe(
      false,
    );
  });

  it("rechaza diagnósticos que intenten incluir contenido con caracteres no permitidos", () => {
    const diagnostics = {
      panelFound: true,
      messageNodes: 1,
      withDate: 0,
      today: 0,
      dateSample: "<b>x</b>",
    };
    const message = {
      type: "reader.status",
      sessionId: "abcdefgh12345678",
      status: "unreadable",
      diagnostics,
    };
    expect(contentMessageSchema.safeParse(message).success).toBe(false);
  });

  it("rechaza tipos de mensaje desconocidos (p. ej. intentos de enviar mensajes)", () => {
    expect(overlayMessageSchema.safeParse({ type: "whatsapp.send", text: "hola" }).success).toBe(
      false,
    );
  });
});
