/**
 * Selectores de WhatsApp Web, aislados en un único archivo.
 *
 * WhatsApp Web no ofrece una API pública y cambia su estructura sin aviso. Si la lectura falla,
 * este es el único archivo que debería necesitar cambios. Fuente: inspección de la interfaz
 * pública; deben validarse con una cuenta real (spike de la Fase 6).
 */
export const WHATSAPP_SELECTORS = {
  /** Panel de la conversación abierta. */
  conversationPanel: "#main",
  /** Título del chat abierto (solo se usa para calcular una huella local, nunca se envía). */
  conversationTitle: "header span[dir='auto']",
  /** Contenedor de cada mensaje; su data-id indica dirección ("true_" saliente, "false_" entrante). */
  messageRow: "[data-id]",
  /** Elemento con el texto copiable; su atributo incluye hora y fecha del mensaje. */
  copyableText: "[data-pre-plain-text]",
  messageText: "span.selectable-text",
  incomingClass: ".message-in",
  outgoingClass: ".message-out",
} as const;

export const PRE_PLAIN_TEXT_ATTRIBUTE = "data-pre-plain-text";
export const GROUP_CHAT_SUFFIX = "@g.us";
