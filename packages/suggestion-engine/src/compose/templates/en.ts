import { inParentheses, type ReplyTemplates, withPrice } from "./types";

export const englishTemplates: ReplyTemplates = {
  greeting: "Hello! We're happy to help. What product are you looking for?",
  greetingPrefix: "Hello!",
  thanks: "You're welcome! We're here to help.",
  clarify: "Hello! Could you tell us which product you're looking for so we can help you?",
  notFound:
    "We couldn't find that product in our catalog right now. Could you give us more details or the exact name?",
  available: (name, price) => `Yes, we have ${name} available${withPrice(" for ", price)}.`,
  availableUnconfirmed: (name, price) =>
    `We should have ${name}${inParentheses(price)}; let me confirm availability.`,
  outOfStock: (name) => `We're currently out of stock of ${name}.`,
  unknownStock: (name) => `Let me check whether we have ${name} available.`,
  priceOnly: (name, price) => `${name} costs ${price}.`,
  priceUnknown: (name) => `Let me confirm the price of ${name}.`,
  needIntro: "For that, we have these options:",
  alternative: (name, price) => `As an alternative, we have ${name}${withPrice(" for ", price)}.`,
  prescription: (name) => `${name} requires a prescription.`,
  offerHold: "Would you like us to set it aside for you?",
  pharmacistAdvice: "Our pharmacist can advise you on which option suits you best.",
  usageAdvice: "Our pharmacist will gladly explain how to use it.",
  statusToConfirm: "to be confirmed",
  statusOutOfStock: "out of stock",
};
