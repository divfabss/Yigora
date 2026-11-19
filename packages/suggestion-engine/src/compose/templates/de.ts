import { inParentheses, type ReplyTemplates, withPrice } from "./types";

export const germanTemplates: ReplyTemplates = {
  greeting: "Hallo! Wir helfen Ihnen gern. Welches Produkt suchen Sie?",
  thanks: "Gern geschehen! Wir sind für Sie da.",
  clarify:
    "Hallo! Könnten Sie uns sagen, welches Produkt Sie suchen, damit wir Ihnen helfen können?",
  notFound:
    "Wir können dieses Produkt derzeit nicht in unserem Sortiment finden. Könnten Sie uns weitere Details oder den genauen Namen nennen?",
  available: (name, price) =>
    `Ja, wir haben ${name} vorrätig${withPrice(" zum Preis von ", price)}.`,
  availableUnconfirmed: (name, price) =>
    `Wir sollten ${name}${inParentheses(price)} vorrätig haben; ich prüfe kurz die Verfügbarkeit.`,
  outOfStock: (name) => `${name} ist derzeit leider nicht vorrätig.`,
  unknownStock: (name) => `Ich prüfe kurz, ob wir ${name} vorrätig haben.`,
  priceOnly: (name, price) => `${name} kostet ${price}.`,
  priceUnknown: (name) => `Ich prüfe kurz den Preis von ${name}.`,
  needIntro: "Dafür haben wir folgende Möglichkeiten:",
  alternative: (name, price) =>
    `Als Alternative haben wir ${name}${withPrice(" zum Preis von ", price)}.`,
  prescription: (name) => `${name} ist verschreibungspflichtig.`,
  offerHold: "Möchten Sie, dass wir es für Sie zurücklegen?",
  pharmacistAdvice: "Unser Apotheker berät Sie gern, welche Option am besten zu Ihnen passt.",
  usageAdvice: "Unser Apotheker erklärt Ihnen gern die Anwendung.",
  statusToConfirm: "wird bestätigt",
  statusOutOfStock: "nicht vorrätig",
};
