import { z } from "zod";

/**
 * Idiomas con plantillas y pruebas dedicadas. La arquitectura admite otros
 * códigos BCP-47 (atendidos por el proveedor de IA).
 */
export const PRIORITY_LANGUAGES = ["es", "en", "pt", "fr", "de", "it"] as const;
export type PriorityLanguage = (typeof PRIORITY_LANGUAGES)[number];

/** Subconjunto simple de BCP-47: idioma (2–3 letras) y región opcional (ISO o UN M.49, p. ej. es-419). */
export const languageCodeSchema = z
  .string()
  .regex(/^[a-z]{2,3}(-([A-Z]{2}|[0-9]{3}))?$/, "Código de idioma inválido");
export type LanguageCode = z.infer<typeof languageCodeSchema>;

const PRIORITY_LANGUAGE_SET: ReadonlySet<string> = new Set(PRIORITY_LANGUAGES);

export function isPriorityLanguage(code: string): code is PriorityLanguage {
  return PRIORITY_LANGUAGE_SET.has(code);
}

/** Idioma base de un código con región: "es-CR" → "es". */
export function baseLanguage(code: LanguageCode): string {
  const [base] = code.split("-");
  return base ?? code;
}

/** Idioma fijo de la interfaz en el MVP. */
export const INTERFACE_LOCALE = "es-419" as const;
