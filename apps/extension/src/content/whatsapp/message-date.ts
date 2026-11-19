/**
 * Fechas de los mensajes de WhatsApp Web.
 *
 * El atributo `data-pre-plain-text` tiene la forma "[hora, fecha] Autor: ". La fecha depende del
 * idioma y la región del navegador: "19/11/2026", "11/19/2026", "2026-11-19", "19.11.26",
 * "19 nov 2026", "Nov 19, 2026"… Solo se lee la fecha; el autor se descarta.
 */
export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Abreviaturas de meses (normalizadas, sin tildes) en es/en/pt/fr/de/it. */
const MONTHS: Readonly<Record<string, number>> = Object.fromEntries(
  [
    ["ene", "jan", "janv", "gen", "enero", "january", "janeiro", "janvier", "januar", "gennaio"],
    ["feb", "fev", "fevr", "febrero", "february", "fevereiro", "fevrier", "februar", "febbraio"],
    ["mar", "mars", "marz", "marzo", "march", "marco", "marz"],
    ["abr", "apr", "avr", "abril", "april", "avril", "aprile"],
    ["may", "mai", "mag", "mayo", "maio", "maggio"],
    ["jun", "juin", "giu", "junio", "june", "junho", "juni", "giugno"],
    ["jul", "juil", "lug", "julio", "july", "julho", "juillet", "juli", "luglio"],
    ["ago", "aug", "aout", "agosto", "august"],
    [
      "sep",
      "sept",
      "set",
      "septiembre",
      "setiembre",
      "september",
      "setembro",
      "septembre",
      "settembre",
    ],
    ["oct", "out", "okt", "ott", "octubre", "october", "outubro", "octobre", "oktober", "ottobre"],
    ["nov", "noviembre", "november", "novembro", "novembre"],
    ["dic", "dec", "dez", "diciembre", "december", "dezembro", "decembre", "dezember", "dicembre"],
  ].flatMap((names, index) => names.map((name) => [name, index + 1])),
);

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\u00a0\u202f]/g, " ")
    .toLowerCase();

const fullYear = (value: number): number => (value < 100 ? 2000 + value : value);

function monthFromName(name: string): number | null {
  const clean = name.replace(/\./g, "");
  return MONTHS[clean] ?? MONTHS[clean.slice(0, 3)] ?? null;
}

/** Parte de la fecha dentro de los corchetes (sin hora ni autor), o null. */
export function extractDateText(prePlainText: string): string | null {
  const bracket = /\[([^\]]+)\]/.exec(prePlainText)?.[1];
  if (!bracket) {
    return null;
  }
  // La hora va antes de la última coma ("10:32 a. m., 19/11/2026") o después ("19/11/2026, 10:32").
  const parts = bracket.split(",").map((part) => part.trim());
  const dateParts = parts.filter((part) => !/^\d{1,2}:\d{2}/.test(part));
  const text = dateParts.join(", ").trim();
  return text === "" ? null : text;
}

function parseNumeric(text: string): CalendarDate[] {
  const ymd = /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/.exec(text);
  if (ymd) {
    return [{ year: Number(ymd[1]), month: Number(ymd[2]), day: Number(ymd[3]) }];
  }
  const numeric = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/.exec(text);
  if (!numeric) {
    return [];
  }
  const first = Number(numeric[1]);
  const second = Number(numeric[2]);
  const year = fullYear(Number(numeric[3]));
  // Ambos órdenes son candidatos (D/M y M/D); se descartan los imposibles.
  return [
    { year, month: second, day: first },
    { year, month: first, day: second },
  ].filter((date) => date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= 31);
}

function parseWithMonthName(text: string): CalendarDate[] {
  const dayFirst = /^(\d{1,2})\.?\s+(?:de\s+)?([a-z.]+)\.?,?\s+(?:de\s+)?(\d{2,4})$/.exec(text);
  const monthFirst = /^([a-z.]+)\.?\s+(\d{1,2}),?\s+(\d{2,4})$/.exec(text);
  const [day, name, year] = dayFirst
    ? [dayFirst[1], dayFirst[2], dayFirst[3]]
    : monthFirst
      ? [monthFirst[2], monthFirst[1], monthFirst[3]]
      : [undefined, undefined, undefined];
  const month = name ? monthFromName(name) : null;
  return month && day && year ? [{ year: fullYear(Number(year)), month, day: Number(day) }] : [];
}

/** Fechas posibles para el texto (puede haber dos si el orden día/mes es ambiguo). */
export function parseDateCandidates(dateText: string): CalendarDate[] {
  const text = normalize(dateText).trim();
  const numeric = parseNumeric(text);
  return numeric.length > 0 ? numeric : parseWithMonthName(text);
}

export function isSameCalendarDay(date: CalendarDate, now: Date): boolean {
  return (
    date.year === now.getFullYear() &&
    date.month === now.getMonth() + 1 &&
    date.day === now.getDate()
  );
}

/**
 * ¿El mensaje es de hoy? Devuelve null si la fecha no se puede interpretar (en ese caso el lector
 * usa los separadores de día o la fecha del mensaje anterior).
 */
export function isMessageFromToday(prePlainText: string, now: Date): boolean | null {
  const dateText = extractDateText(prePlainText);
  const candidates = dateText ? parseDateCandidates(dateText) : [];
  if (candidates.length === 0) {
    return null;
  }
  return candidates.some((date) => isSameCalendarDay(date, now));
}
