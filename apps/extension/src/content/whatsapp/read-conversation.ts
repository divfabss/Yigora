import type { ConversationMessage, MessageDirection } from "@yigora/suggestion-engine";
import {
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES_PER_SNAPSHOT,
  type ChatSnapshot,
} from "../../shared/messages";
import { fingerprint } from "./hash";
import { isMessageFromToday } from "./message-date";
import { GROUP_CHAT_SUFFIX, PRE_PLAIN_TEXT_ATTRIBUTE, WHATSAPP_SELECTORS as S } from "./selectors";

/**
 * Lector de SOLO LECTURA del chat abierto en WhatsApp Web.
 * No modifica la página, no hace clic, no desplaza y no escribe. Extrae únicamente el texto y la
 * dirección de los mensajes de hoy; descarta nombres, teléfonos, multimedia y metadatos.
 */
export type ReadResult =
  | { readonly status: "reading"; readonly snapshot: ChatSnapshot }
  | { readonly status: "no_chat" | "group" | "unreadable" };

function resolveDirection(row: Element, dataId: string): MessageDirection | null {
  if (dataId.startsWith("true_")) {
    return "outgoing";
  }
  if (dataId.startsWith("false_")) {
    return "incoming";
  }
  if (row.matches(S.outgoingClass) || row.querySelector(S.outgoingClass)) {
    return "outgoing";
  }
  return row.matches(S.incomingClass) || row.querySelector(S.incomingClass) ? "incoming" : null;
}

/** Filas de mensajes de primer nivel (excluye mensajes citados anidados). */
function messageRows(panel: Element): Element[] {
  return [...panel.querySelectorAll(S.messageRow)].filter(
    (row) => !row.parentElement?.closest(S.messageRow),
  );
}

function readMessage(row: Element, now: Date): ConversationMessage | null {
  const copyable = row.querySelector(S.copyableText);
  const stamp = copyable?.getAttribute(PRE_PLAIN_TEXT_ATTRIBUTE);
  if (!copyable || !stamp || isMessageFromToday(stamp, now) !== true) {
    return null;
  }
  const direction = resolveDirection(row, row.getAttribute("data-id") ?? "");
  const text = (copyable.querySelector(S.messageText) ?? copyable).textContent.trim();
  if (!direction || text === "") {
    return null;
  }
  return { direction, text: text.slice(0, MAX_MESSAGE_LENGTH) };
}

/** Identificador del chat a partir del data-id ("false_<chat>_<id>"), sin salir de esta función. */
function chatIdentity(rows: readonly Element[], panel: Element): string {
  const dataId = rows
    .map((row) => row.getAttribute("data-id") ?? "")
    .find((id) => id.includes("_"));
  const chat = dataId?.split("_")[1];
  return chat ?? panel.querySelector(S.conversationTitle)?.textContent ?? "unknown";
}

export function readOpenChat(doc: Document, now: Date): ReadResult {
  const panel = doc.querySelector(S.conversationPanel);
  if (!panel) {
    return { status: "no_chat" };
  }
  const rows = messageRows(panel);
  if (rows.length === 0 && !panel.querySelector(S.copyableText)) {
    return { status: "unreadable" };
  }
  if (rows.some((row) => (row.getAttribute("data-id") ?? "").includes(GROUP_CHAT_SUFFIX))) {
    return { status: "group" };
  }
  const messages = rows
    .map((row) => readMessage(row, now))
    .filter((message): message is ConversationMessage => message !== null)
    .slice(-MAX_MESSAGES_PER_SNAPSHOT);
  return {
    status: "reading",
    snapshot: { chatKey: fingerprint(chatIdentity(rows, panel)), messages },
  };
}
