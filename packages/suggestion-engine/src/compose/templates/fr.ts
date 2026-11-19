import { inParentheses, type ReplyTemplates, withPrice } from "./types";

export const frenchTemplates: ReplyTemplates = {
  greeting: "Bonjour ! Avec plaisir. Quel produit recherchez-vous ?",
  thanks: "Avec plaisir ! Nous restons à votre disposition.",
  clarify:
    "Bonjour ! Pourriez-vous nous indiquer le produit que vous recherchez afin que nous puissions vous aider ?",
  notFound:
    "Nous ne trouvons pas ce produit dans notre catalogue pour le moment. Pourriez-vous nous donner plus de détails ou le nom exact ?",
  available: (name, price) =>
    `Oui, nous avons ${name} en stock${withPrice(" au prix de ", price)}.`,
  availableUnconfirmed: (name, price) =>
    `Nous devrions avoir ${name}${inParentheses(price)} ; je vérifie la disponibilité.`,
  outOfStock: (name) => `Nous sommes actuellement en rupture de stock pour ${name}.`,
  unknownStock: (name) => `Je vérifie si nous avons ${name} en stock.`,
  priceOnly: (name, price) => `${name} coûte ${price}.`,
  priceUnknown: (name) => `Je vérifie le prix de ${name}.`,
  needIntro: "Pour cela, nous avons ces options :",
  alternative: (name, price) =>
    `Comme alternative, nous avons ${name}${withPrice(" au prix de ", price)}.`,
  prescription: (name) => `${name} nécessite une ordonnance.`,
  offerHold: "Souhaitez-vous que nous vous le mettions de côté ?",
  pharmacistAdvice: "Notre pharmacien peut vous conseiller sur l'option la plus adaptée.",
  usageAdvice: "Notre pharmacien vous expliquera volontiers comment l'utiliser.",
  statusToConfirm: "à confirmer",
  statusOutOfStock: "en rupture",
};
