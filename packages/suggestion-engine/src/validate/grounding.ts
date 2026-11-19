/**
 * Validador de veracidad: toda cifra que aparezca en una respuesta debe existir en los datos
 * de origen (nombres de producto o precios formateados). Protege contra cantidades, precios o
 * dosis inventados, especialmente cuando la respuesta proviene de un modelo de IA.
 */
const NUMBER_PATTERN = /\d+(?:[.,\s\u00a0\u202f]\d+)*/gu;

function canonicalNumbers(text: string): string[] {
  return (text.match(NUMBER_PATTERN) ?? []).map((value) =>
    value.replace(/[.,\s\u00a0\u202f]/gu, ""),
  );
}

export function findUngroundedNumbers(reply: string, sources: readonly string[]): string[] {
  const allowed = new Set(sources.flatMap(canonicalNumbers));
  return canonicalNumbers(reply).filter((value) => !allowed.has(value));
}

export function isGrounded(reply: string, sources: readonly string[]): boolean {
  return findUngroundedNumbers(reply, sources).length === 0;
}
