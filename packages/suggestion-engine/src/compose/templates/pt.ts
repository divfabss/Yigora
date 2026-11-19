import { inParentheses, type ReplyTemplates, withPrice } from "./types";

export const portugueseTemplates: ReplyTemplates = {
  greeting: "Olá! Será um prazer ajudar. Qual produto você procura?",
  greetingPrefix: "Olá!",
  thanks: "Por nada! Estamos à disposição.",
  clarify: "Olá! Poderia nos dizer qual produto você procura para podermos ajudar?",
  notFound:
    "No momento não encontramos esse produto no nosso catálogo. Poderia nos dar mais detalhes ou o nome exato?",
  available: (name, price) => `Sim, temos ${name} disponível${withPrice(" por ", price)}.`,
  availableUnconfirmed: (name, price) =>
    `Devemos ter ${name}${inParentheses(price)}; vou confirmar a disponibilidade.`,
  outOfStock: (name) => `No momento estamos sem ${name} em estoque.`,
  unknownStock: (name) => `Vou verificar se temos ${name} disponível.`,
  priceOnly: (name, price) => `${name} custa ${price}.`,
  priceUnknown: (name) => `Vou confirmar o preço de ${name}.`,
  needIntro: "Para isso, temos estas opções:",
  alternative: (name, price) => `Como alternativa, temos ${name}${withPrice(" por ", price)}.`,
  prescription: (name) => `${name} exige receita médica.`,
  offerHold: "Gostaria que reservássemos para você?",
  pharmacistAdvice: "Nosso farmacêutico pode orientar você sobre a opção mais adequada.",
  usageAdvice: "Nosso farmacêutico terá prazer em explicar como usá-lo.",
  statusToConfirm: "a confirmar",
  statusOutOfStock: "esgotado",
};
