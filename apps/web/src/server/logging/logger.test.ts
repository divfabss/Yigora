import { describe, expect, it } from "vitest";
import { createLogger, type LogRecord, sanitizeLogFields } from "./logger";

describe("sanitizeLogFields", () => {
  it("descarta campos fuera de la lista blanca, como el contenido de mensajes", () => {
    const result = sanitizeLogFields({
      route: "/api/v1/suggestions",
      message: "Hola, necesito algo para la presión, mi número es 8888-8888",
      accessToken: "eyJ...",
    });
    expect(result.fields).toEqual({ route: "/api/v1/suggestions" });
    expect(result.droppedFields).toBe(2);
  });

  it("descarta valores no primitivos aunque el campo esté permitido", () => {
    const result = sanitizeLogFields({ operation: { nested: "dato" }, status: 200 });
    expect(result.fields).toEqual({ status: 200 });
    expect(result.droppedFields).toBe(1);
  });

  it("recorta textos largos", () => {
    const result = sanitizeLogFields({ errorCode: "x".repeat(500) });
    expect(String(result.fields.errorCode).length).toBeLessThanOrEqual(121);
  });
});

describe("createLogger", () => {
  it("emite registros estructurados saneados", () => {
    const records: LogRecord[] = [];
    const log = createLogger(
      (record) => records.push(record),
      () => new Date("2026-11-18T00:00:00Z"),
    );
    log.info("request.completed", { status: 200, body: "secreto" });
    expect(records).toEqual([
      {
        level: "info",
        event: "request.completed",
        timestamp: "2026-11-18T00:00:00.000Z",
        fields: { status: 200 },
        droppedFields: 1,
      },
    ]);
  });
});
