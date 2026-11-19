import type { ConversationMessage } from "./types";

export interface CustomerTurn {
  /** Mensajes del cliente que el vendedor debe responder. */
  readonly messages: readonly ConversationMessage[];
  /** Mensajes previos del cliente, usados como contexto (p. ej. para detectar idioma). */
  readonly context: readonly ConversationMessage[];
  readonly awaitingCustomer: boolean;
}

const MAX_CONTEXT_MESSAGES = 10;

/**
 * Identifica el turno actual del cliente: los mensajes entrantes posteriores al último mensaje
 * del vendedor. Si el vendedor ya respondió, se usa el último bloque del cliente.
 */
export function extractCustomerTurn(messages: readonly ConversationMessage[]): CustomerTurn {
  const recent = messages
    .slice(-MAX_CONTEXT_MESSAGES * 2)
    .filter((message) => message.text.trim() !== "");
  const lastIncomingIndex = recent.findLastIndex((message) => message.direction === "incoming");
  if (lastIncomingIndex === -1) {
    return { messages: [], context: [], awaitingCustomer: false };
  }
  let start = lastIncomingIndex;
  while (start > 0 && recent[start - 1]?.direction === "incoming") {
    start -= 1;
  }
  const incoming = (list: readonly ConversationMessage[]) =>
    list.filter((message) => message.direction === "incoming");
  return {
    messages: recent.slice(start, lastIncomingIndex + 1),
    context: incoming(recent.slice(0, start)).slice(-MAX_CONTEXT_MESSAGES),
    awaitingCustomer: lastIncomingIndex < recent.length - 1,
  };
}
