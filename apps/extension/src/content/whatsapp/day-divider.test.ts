import { describe, expect, it } from "vitest";
import { classifyDayDivider } from "./day-divider";

const now = new Date(2026, 10, 19, 10, 0, 0);

describe("classifyDayDivider", () => {
  it.each(["HOY", "Hoy", "TODAY", "Hoje", "Aujourd’hui", "Heute", "Oggi", "19/11/2026"])(
    "%s es hoy",
    (text) => {
      expect(classifyDayDivider(text, now)).toBe("today");
    },
  );

  it.each(["AYER", "Yesterday", "lunes", "18/11/2026", "17 nov 2026"])("%s no es hoy", (text) => {
    expect(classifyDayDivider(text, now)).toBe("other");
  });

  it("ignora textos que no son separadores", () => {
    expect(classifyDayDivider("Los mensajes están cifrados de extremo a extremo.", now)).toBeNull();
  });
});
