import { describe, expect, it } from "vitest";
import { isMessageFromToday } from "./message-date";

const now = new Date(2026, 10, 19, 10, 0, 0);

describe("isMessageFromToday", () => {
  it.each([
    "[10:32, 19/11/2026] Nombre: ",
    "[10:32 a. m., 19/11/2026] Nombre: ",
    "[10:32 AM, 11/19/2026] Name: ",
    "[10:32, 19.11.26] Name: ",
    "[10:32, 2026-11-19] Name: ",
  ])("reconoce hoy en %s", (stamp) => {
    expect(isMessageFromToday(stamp, now)).toBe(true);
  });

  it.each([
    "[10:32, 18/11/2026] Nombre: ",
    "[10:32, 19/11/2025] Nombre: ",
    "[09:00, 2026-11-18] x: ",
  ])("descarta otros días: %s", (stamp) => {
    expect(isMessageFromToday(stamp, now)).toBe(false);
  });

  it("devuelve null si no hay fecha interpretable", () => {
    expect(isMessageFromToday("sin fecha", now)).toBeNull();
    expect(isMessageFromToday("[10:32] Nombre: ", now)).toBeNull();
  });
});

describe("formatos adicionales de fecha", () => {
  it.each([
    "[10:32, 19 nov 2026] Nombre: ",
    "[10:32, 19 de noviembre de 2026] Nombre: ",
    "[10:32 AM, Nov 19, 2026] Name: ",
    "[10:32, 19. Nov. 2026] Name: ",
    "[10:32\u202fa.\u00a0m., 19/11/2026] Nombre: ",
    "[19/11/2026, 10:32] Nombre: ",
  ])("reconoce hoy en %s", (stamp) => {
    expect(isMessageFromToday(stamp, now)).toBe(true);
  });
});
