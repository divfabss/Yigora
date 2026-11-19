import type { CatalogKeyword, KeywordKind } from "@yigora/suggestion-engine";

type Translations = Partial<Record<"es" | "en" | "pt" | "fr" | "de" | "it", readonly string[]>>;

/** Expande una tabla de traducciones a palabras clave del catálogo. */
export function keywords(kind: KeywordKind, translations: Translations): CatalogKeyword[] {
  return Object.entries(translations).flatMap(([language, words]) =>
    words.map((keyword) => ({ keyword, language, kind })),
  );
}

export const ALLERGY = keywords("indication", {
  es: ["alergia", "alergias", "estornudos", "rinitis"],
  en: ["allergy", "allergies", "sneezing", "hay fever"],
  pt: ["alergia", "alergias", "espirros"],
  fr: ["allergie", "allergies", "éternuements"],
  de: ["Allergie", "Allergien", "Heuschnupfen"],
  it: ["allergia", "allergie", "starnuti"],
});

export const PAIN_AND_FEVER = keywords("indication", {
  es: ["dolor de cabeza", "fiebre", "dolor", "calentura"],
  en: ["headache", "fever", "pain"],
  pt: ["dor de cabeça", "febre", "dor"],
  fr: ["mal de tête", "fièvre", "douleur"],
  de: ["Kopfschmerzen", "Fieber", "Schmerzen"],
  it: ["mal di testa", "febbre", "dolore"],
});

export const INFLAMMATION = keywords("indication", {
  es: ["inflamación", "dolor muscular"],
  en: ["inflammation", "muscle pain"],
  pt: ["inflamação", "dor muscular"],
  fr: ["inflammation", "douleur musculaire"],
  de: ["Entzündung", "Muskelschmerzen"],
  it: ["infiammazione", "dolore muscolare"],
});

export const DEHYDRATION = keywords("indication", {
  es: ["deshidratación", "diarrea", "suero"],
  en: ["dehydration", "diarrhea", "oral rehydration"],
  pt: ["desidratação", "diarreia", "soro"],
  fr: ["déshydratation", "diarrhée"],
  de: ["Dehydration", "Durchfall"],
  it: ["disidratazione", "diarrea"],
});

export const HEARTBURN = keywords("indication", {
  es: ["acidez", "agruras", "gastritis"],
  en: ["heartburn", "acid reflux"],
  pt: ["azia", "refluxo"],
  fr: ["brûlures d'estomac", "reflux"],
  de: ["Sodbrennen"],
  it: ["bruciore di stomaco", "reflusso"],
});

export const COUGH = keywords("indication", {
  es: ["tos"],
  en: ["cough"],
  pt: ["tosse"],
  fr: ["toux"],
  de: ["Husten"],
  it: ["tosse"],
});

export const SORE_THROAT = keywords("indication", {
  es: ["dolor de garganta", "garganta"],
  en: ["sore throat", "throat"],
  pt: ["dor de garganta", "garganta"],
  fr: ["mal de gorge", "gorge"],
  de: ["Halsschmerzen"],
  it: ["mal di gola", "gola"],
});
