import { isSameCalendarDay, parseDateCandidates } from "./message-date";

/**
 * Separadores de día de WhatsApp ("HOY", "AYER", "lunes", "19/11/2026"…). Indican la fecha de los
 * mensajes que siguen cuando un mensaje no trae fecha legible.
 */
const TODAY_WORDS = new Set(["hoy", "today", "hoje", "aujourd'hui", "aujourdhui", "heute", "oggi"]);

const MAX_DIVIDER_LENGTH = 40;

/** "today" si el separador es de hoy, "other" si es de otro día, null si no es un separador. */
export function classifyDayDivider(text: string, now: Date): "today" | "other" | null {
  const clean = text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[’`]/g, "'")
    .trim()
    .toLowerCase();
  if (clean === "" || clean.length > MAX_DIVIDER_LENGTH) {
    return null;
  }
  if (TODAY_WORDS.has(clean)) {
    return "today";
  }
  const dates = parseDateCandidates(clean);
  if (dates.length > 0) {
    return dates.some((date) => isSameCalendarDay(date, now)) ? "today" : "other";
  }
  // Ayer, días de la semana u otros textos cortos de una sola palabra: no es hoy.
  return /^[a-z]+$/.test(clean) ? "other" : null;
}
