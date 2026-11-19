/**
 * Selectores de WhatsApp Web, aislados en un único archivo.
 *
 * WhatsApp Web no ofrece una API pública y cambia su estructura sin aviso. Se usan anclas
 * estructurales (ids, atributos data-*, roles) en lugar de clases ofuscadas, con alternativas
 * en orden de preferencia. Verificado contra extensiones de código abierto mantenidas en 2026
 * que leen el DOM de WhatsApp Web; debe revalidarse con una cuenta real tras cada cambio de WhatsApp.
 */
export const WHATSAPP_SELECTORS = {
  /** Panel de la conversación abierta (alternativas en orden). */
  conversationPanel: ["#main", "[data-testid='conversation-panel-wrapper']"],
  /** Título del chat abierto (solo para una huella local; nunca se envía). */
  conversationTitle: [
    "header [data-testid='conversation-info-header-chat-title']",
    "header span[dir='auto'][title]",
    "header span[title]",
    "header span[dir='auto']",
  ],
  /** Filas de la conversación en orden (mensajes y separadores de día como "HOY"). */
  timelineRow: "[role='row']",
  /** Contenedor de cada mensaje; su data-id empieza con "true_" (saliente) o "false_" (entrante). */
  messageRow: "[data-id]",
  /** Elemento con el texto copiable; su atributo incluye hora, fecha y autor. */
  copyableText: "[data-pre-plain-text]",
  messageText: ".selectable-text",
  /** Contenedor de un mensaje citado (respuesta a otro mensaje): su texto no es el del cliente. */
  quotedMessage:
    "[aria-label*='Quoted' i], [aria-label*='citado' i], [data-testid='quoted-message']",
  incomingClass: ".message-in",
  outgoingClass: ".message-out",
} as const;

export const PRE_PLAIN_TEXT_ATTRIBUTE = "data-pre-plain-text";
export const MESSAGE_ID_PATTERN = /^(true|false)_/;
export const GROUP_CHAT_SUFFIX = "@g.us";

/** Devuelve el primer elemento que coincide con alguno de los selectores. */
export function queryFirst(root: ParentNode, selectors: readonly string[]): Element | null {
  for (const selector of selectors) {
    const found = root.querySelector(selector);
    if (found) {
      return found;
    }
  }
  return null;
}
