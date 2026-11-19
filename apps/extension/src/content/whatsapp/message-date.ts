/**
 * Determina si un mensaje es de HOY a partir del atributo de WhatsApp
 * "[10:32, 18/11/2026] Nombre: ". Solo se lee la fecha; el nombre se descarta.
 *
 * Admite D/M/A, M/D/A y A-M-D. Devuelve null si la fecha no se puede interpretar
 * (en ese caso el mensaje se excluye).
 */
export function isMessageFromToday(prePlainText: string, now: Date): boolean | null {
  const bracket = /\[([^\]]+)\]/.exec(prePlainText)?.[1];
  const date = bracket ? /(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})/.exec(bracket) : null;
  if (!date) {
    return null;
  }
  const [first, second, third] = [date[1], date[2], date[3]].map(Number) as [
    number,
    number,
    number,
  ];
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const isCurrentYear = (value: number) =>
    value === now.getFullYear() || value === now.getFullYear() % 100;

  if (first > 31) {
    return isCurrentYear(first) && second === month && third === day;
  }
  if (!isCurrentYear(third)) {
    return false;
  }
  return (first === day && second === month) || (first === month && second === day);
}
