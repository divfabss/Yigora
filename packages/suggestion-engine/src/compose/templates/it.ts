import { inParentheses, type ReplyTemplates, withPrice } from "./types";

export const italianTemplates: ReplyTemplates = {
  greeting: "Salve! Siamo felici di aiutarla. Quale prodotto sta cercando?",
  thanks: "Prego! Siamo a sua disposizione.",
  clarify: "Salve! Potrebbe indicarci quale prodotto sta cercando, così possiamo aiutarla?",
  notFound:
    "Al momento non troviamo questo prodotto nel nostro catalogo. Potrebbe darci maggiori dettagli o il nome esatto?",
  available: (name, price) => `Sì, abbiamo ${name} disponibile${withPrice(" a ", price)}.`,
  availableUnconfirmed: (name, price) =>
    `Dovremmo avere ${name}${inParentheses(price)}; verifico subito la disponibilità.`,
  outOfStock: (name) => `Al momento ${name} non è disponibile.`,
  unknownStock: (name) => `Verifico subito se abbiamo ${name} disponibile.`,
  priceOnly: (name, price) => `${name} costa ${price}.`,
  priceUnknown: (name) => `Verifico subito il prezzo di ${name}.`,
  needIntro: "Per questo abbiamo queste opzioni:",
  alternative: (name, price) => `In alternativa abbiamo ${name}${withPrice(" a ", price)}.`,
  prescription: (name) => `${name} richiede la ricetta medica.`,
  offerHold: "Desidera che glielo mettiamo da parte?",
  pharmacistAdvice: "Il nostro farmacista può consigliarle l'opzione più adatta.",
  usageAdvice: "Il nostro farmacista le spiegherà volentieri come usarlo.",
  statusToConfirm: "da confermare",
  statusOutOfStock: "esaurito",
};
