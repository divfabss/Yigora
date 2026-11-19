import type { PriorityLanguage } from "@yigora/domain";
import { germanTemplates } from "./de";
import { englishTemplates } from "./en";
import { spanishTemplates } from "./es";
import { frenchTemplates } from "./fr";
import { italianTemplates } from "./it";
import { portugueseTemplates } from "./pt";
import type { ReplyTemplates } from "./types";

export const REPLY_TEMPLATES: Readonly<Record<PriorityLanguage, ReplyTemplates>> = {
  es: spanishTemplates,
  en: englishTemplates,
  pt: portugueseTemplates,
  fr: frenchTemplates,
  de: germanTemplates,
  it: italianTemplates,
};

/** Configuración regional para formatear precios en cada idioma de respuesta. */
export const NUMBER_LOCALES: Readonly<Record<PriorityLanguage, string>> = {
  es: "es-419",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
};

export type { ReplyTemplates } from "./types";
