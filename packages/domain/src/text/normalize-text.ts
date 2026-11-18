/**
 * Normaliza texto para comparar nombres y palabras clave: sin tildes ni diacríticos,
 * minúsculas y espacios colapsados.
 *
 * Debe producir el mismo resultado que `app.normalize_text` en PostgreSQL
 * (supabase/migrations/20261118000001_extensions_and_helpers.sql).
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
