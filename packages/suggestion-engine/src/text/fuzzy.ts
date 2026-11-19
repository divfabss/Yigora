/** Distancia de Levenshtein con corte temprano cuando supera `maxDistance`. */
export function boundedLevenshtein(a: string, b: string, maxDistance: number): number {
  if (Math.abs(a.length - b.length) > maxDistance) {
    return maxDistance + 1;
  }
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMinimum = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        (previous[j] ?? 0) + 1,
        (current[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + cost,
      );
      current.push(value);
      rowMinimum = Math.min(rowMinimum, value);
    }
    if (rowMinimum > maxDistance) {
      return maxDistance + 1;
    }
    previous = current;
  }
  return previous[b.length] ?? maxDistance + 1;
}

/**
 * Coincidencia tolerante a errores ortográficos entre una palabra del cliente y un término.
 * Términos cortos exigen coincidencia exacta para evitar falsos positivos.
 */
export function fuzzyTokenMatch(token: string, term: string): boolean {
  if (token === term) {
    return true;
  }
  if (term.length < 5 || token.length < 4) {
    return false;
  }
  const allowed = term.length >= 8 ? 2 : 1;
  return boundedLevenshtein(token, term, allowed) <= allowed;
}
