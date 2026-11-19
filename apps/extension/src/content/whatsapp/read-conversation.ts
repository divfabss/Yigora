import type { ConversationMessage, MessageDirection } from "@yigora/suggestion-engine";
import {
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES_PER_SNAPSHOT,
  type ChatSnapshot,
} from "../../shared/messages";
import { fingerprint } from "./hash";
import { isMessageFromToday } from "./message-date";
import { readMessageText } from "./message-text";
import {
  GROUP_CHAT_SUFFIX,
  MESSAGE_ID_PATTERN,
  PRE_PLAIN_TEXT_ATTRIBUTE,
  queryFirst,
  WHATSAPP_SELECTORS as S,
} from "./selectors";

/**
 * Lector de SOLO LECTURA del chat abierto en WhatsApp Web.
 * No modifica la página, no hace clic, no desplaza y no escribe. Extrae únicamente el texto y la
 * dirección de los mensajes de hoy; descarta nombres, teléfonos, multimedia y metadatos.
 */
export type ReadResult =
  | { readonly status: "reading"; readonly snapshot: ChatSnapshot }
  | { readonly status: "no_chat" | "group" | "unreadable" };

function resolveDirection(row: Element): MessageDirection | null {
  const dataId = row.getAttribute("data-id") ?? "";
  if (dataId.startsWith("true_")) {
    return "outgoing";
  }
  if (dataId.startsWith("false_")) {
    return "incoming";
  }
  if (row.closest(S.outgoingClass) ?? row.querySelector(S.outgoingClass)) {
    return "outgoing";
  }
  return (row.closest(S.incomingClass) ?? row.querySelector(S.incomingClass)) ? "incoming" : null;
}

/**
 * Filas de mensajes de primer nivel. Se prefieren los data-id con formato de mensaje
 * ("true_…"/"false_…"); si WhatsApp cambió ese formato, se usan las clases de dirección.
 */
function messageRows(panel: Element): Element[] {
  const outermost = [...panel.querySelectorAll(S.messageRow)].filter(
    (row) => !row.parentElement?.closest(S.messageRow),
  );
  const byId = outermost.filter((row) =>
    MESSAGE_ID_PATTERN.test(row.getAttribute("data-id") ?? ""),
  );
  return byId.length > 0 ? byId : outermost.filter((row) => resolveDirection(row) !== null);
}

/** Autor según el atributo "[hora, fecha] Autor: ". Solo se usa para contar autores en memoria. */
function authorOf(stamp: string): string {
  return stamp.replace(/^\[[^\]]*\]\s*/, "").replace(/:\s*$/, "");
}

function isGroupChat(rows: readonly Element[]): boolean {
  if (rows.some((row) => (row.getAttribute("data-id") ?? "").includes(GROUP_CHAT_SUFFIX))) {
    return true;
  }
  const incomingAuthors = new Set(
    rows
      .filter((row) => resolveDirection(row) === "incoming")
      .map((row) => row.querySelector(S.copyableText)?.getAttribute(PRE_PLAIN_TEXT_ATTRIBUTE) ?? "")
      .filter((stamp) => stamp !== "")
      .map(authorOf)
      // Un mismo contacto puede aparecer como nombre o como número: los números no cuentan.
      .filter((author) => author !== "" && !/^[+\d\s().-]+$/.test(author)),
  );
  return incomingAuthors.size > 1;
}

function readMessage(row: Element, now: Date): ConversationMessage | null {
  const copyable = row.querySelector(S.copyableText);
  const stamp = copyable?.getAttribute(PRE_PLAIN_TEXT_ATTRIBUTE);
  if (!copyable || !stamp || isMessageFromToday(stamp, now) !== true) {
    return null;
  }
  const direction = resolveDirection(row);
  const text = readMessageText(copyable);
  if (!direction || text === "") {
    return null;
  }
  return { direction, text: text.slice(0, MAX_MESSAGE_LENGTH) };
}

/** Identidad del chat (data-id "false_<chat>_<id>" o título), usada solo para una huella local. */
function chatIdentity(rows: readonly Element[], panel: Element): string {
  const dataId = rows
    .map((row) => row.getAttribute("data-id") ?? "")
    .find((id) => MESSAGE_ID_PATTERN.test(id));
  const chat = dataId?.split("_")[1];
  if (chat) {
    return chat;
  }
  const title = queryFirst(panel, S.conversationTitle);
  return title?.getAttribute("title") ?? title?.textContent ?? "unknown";
}

export function readOpenChat(doc: Document, now: Date): ReadResult {
  const panel = queryFirst(doc, S.conversationPanel);
  if (!panel) {
    return { status: "no_chat" };
  }
  const rows = messageRows(panel);
  if (rows.length === 0) {
    // Hay un chat abierto pero no se reconoce ningún mensaje: la estructura de WhatsApp cambió.
    return { status: "unreadable" };
  }
  if (isGroupChat(rows)) {
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
