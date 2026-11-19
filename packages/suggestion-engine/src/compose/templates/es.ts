import { inParentheses, type ReplyTemplates, withPrice } from "./types";

export const spanishTemplates: ReplyTemplates = {
  greeting: "¡Hola! Con gusto le ayudamos. ¿Qué producto busca?",
  greetingPrefix: "¡Hola!",
  thanks: "¡Con mucho gusto! Estamos para servirle.",
  clarify: "¡Hola! ¿Podría indicarnos qué producto busca para ayudarle?",
  notFound:
    "En este momento no encontramos ese producto en nuestro catálogo. ¿Podría darnos más detalles o el nombre exacto?",
  available: (name, price) => `Sí, tenemos ${name} disponible${withPrice(" a ", price)}.`,
  availableUnconfirmed: (name, price) =>
    `Deberíamos tener ${name}${inParentheses(price)}; permítame confirmar la disponibilidad.`,
  outOfStock: (name) => `En este momento no tenemos ${name} en existencia.`,
  unknownStock: (name) => `Permítame verificar si tenemos ${name} disponible.`,
  priceOnly: (name, price) => `${name} tiene un precio de ${price}.`,
  priceUnknown: (name) => `Permítame confirmar el precio de ${name}.`,
  needIntro: "Para eso tenemos estas opciones:",
  alternative: (name, price) => `Como alternativa tenemos ${name}${withPrice(" a ", price)}.`,
  prescription: (name) => `${name} requiere receta médica.`,
  offerHold: "¿Desea que se lo apartemos?",
  pharmacistAdvice:
    "Nuestro farmacéutico puede orientarle sobre cuál es el más adecuado para usted.",
  usageAdvice: "Nuestro farmacéutico con gusto le explica cómo usarlo.",
  statusToConfirm: "por confirmar",
  statusOutOfStock: "agotado",
};
