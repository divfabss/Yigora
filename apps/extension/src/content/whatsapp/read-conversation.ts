import type { ConversationMessage, MessageDirection } from "@yigora/suggestion-engine";
import {
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES_PER_SNAPSHOT,
  type ChatSnapshot,
  type ReaderDiagnostics,
} from "../../shared/messages";
import { classifyDayDivider } from "./day-divider";
import { fingerprint } from "./hash";
import { extractDateText, isMessageFromToday } from "./message-date";
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
  | {
      readonly status: "reading";
      readonly snapshot: ChatSnapshot;
      readonly diagnostics: ReaderDiagnostics;
    }
  | {
      readonly status: "no_chat" | "group" | "unreadable";
      readonly diagnostics: ReaderDiagnostics;
    };

const EMPTY_DIAGNOSTICS: ReaderDiagnostics = {
  panelFound: false,
  messageNodes: 0,
  withDate: 0,
  today: 0,
  dateSample: null,
};

function resolveDirection(node: Element): MessageDirection | null {
  const dataId = node.getAttribute("data-id") ?? "";
  if (dataId.startsWith("true_")) {
    return "outgoing";
  }
  if (dataId.startsWith("false_")) {
    return "incoming";
  }
  if (node.closest(S.outgoingClass) ?? node.querySelector(S.outgoingClass)) {
    return "outgoing";
  }
  return (node.closest(S.incomingClass) ?? node.querySelector(S.incomingClass)) ? "incoming" : null;
}

/** Nodos de mensaje de primer nivel; se prefieren los data-id "true_…"/"false_…". */
function messageNodes(panel: Element): Element[] {
  const outermost = [...panel.querySelectorAll(S.messageRow)].filter(
    (node) => !node.parentElement?.closest(S.messageRow),
  );
  const byId = outermost.filter((node) =>
    MESSAGE_ID_PATTERN.test(node.getAttribute("data-id") ?? ""),
  );
  return byId.length > 0 ? byId : outermost.filter((node) => resolveDirection(node) !== null);
}

const stampOf = (node: Element): string =>
  node.querySelector(S.copyableText)?.getAttribute(PRE_PLAIN_TEXT_ATTRIBUTE) ?? "";

/** Autor según "[hora, fecha] Autor: ". Solo se usa para contar autores en memoria. */
const authorOf = (stamp: string): string =>
  stamp.replace(/^\[[^\]]*\]\s*/, "").replace(/:\s*$/, "");

function isGroupChat(nodes: readonly Element[]): boolean {
  if (nodes.some((node) => (node.getAttribute("data-id") ?? "").includes(GROUP_CHAT_SUFFIX))) {
    return true;
  }
  const authors = new Set(
    nodes
      .filter((node) => resolveDirection(node) === "incoming")
      .map((node) => authorOf(stampOf(node)))
      // Un mismo contacto puede aparecer como nombre o como número: los números no cuentan.
      .filter((author) => author !== "" && !/^[+\d\s().-]+$/.test(author)),
  );
  return authors.size > 1;
}

/** Elementos en orden de pantalla: filas de mensaje y separadores de día. */
function timelineItems(panel: Element, nodes: readonly Element[]): Element[] {
  const rows = [...panel.querySelectorAll(S.timelineRow)];
  return rows.length > 0 ? rows : [...nodes];
}

interface TimelineState {
  isToday: boolean | null;
  readonly messages: ConversationMessage[];
  diagnostics: ReaderDiagnostics;
}

/** Actualiza el diagnóstico (sin contenido) y devuelve si el mensaje es de hoy según su fecha. */
function inspectDate(node: Element, state: TimelineState, now: Date): void {
  const stamp = stampOf(node);
  const fromStamp = stamp ? isMessageFromToday(stamp, now) : null;
  const dateText = stamp ? extractDateText(stamp) : null;
  const unrecognized = fromStamp === null && dateText !== null;
  state.diagnostics = {
    ...state.diagnostics,
    withDate: state.diagnostics.withDate + (fromStamp === null ? 0 : 1),
    dateSample: unrecognized ? dateText.slice(0, 40) : state.diagnostics.dateSample,
  };
  if (fromStamp !== null) {
    state.isToday = fromStamp;
  }
}

/** Texto del mensaje; vacío si no tiene bloque de texto (fotos, audios, stickers). */
function textOf(node: Element): string {
  const copyable = node.querySelector(S.copyableText);
  const hasText = copyable !== null || node.querySelector(S.messageText) !== null;
  return hasText ? readMessageText(copyable ?? node).slice(0, MAX_MESSAGE_LENGTH) : "";
}

function visitMessage(node: Element, state: TimelineState, now: Date): void {
  inspectDate(node, state, now);
  const direction = resolveDirection(node);
  const text = textOf(node);
  if (state.isToday === true && direction && text !== "") {
    state.messages.push({ direction, text });
    state.diagnostics = { ...state.diagnostics, today: state.diagnostics.today + 1 };
  }
}

function readTimeline(panel: Element, nodes: readonly Element[], now: Date): TimelineState {
  const nodeSet = new Set(nodes);
  const state: TimelineState = {
    isToday: null,
    messages: [],
    diagnostics: { ...EMPTY_DIAGNOSTICS, panelFound: true, messageNodes: nodes.length },
  };
  for (const item of timelineItems(panel, nodes)) {
    const node = nodeSet.has(item) ? item : nodes.find((candidate) => item.contains(candidate));
    if (node) {
      visitMessage(node, state, now);
      continue;
    }
    const divider = classifyDayDivider(item.textContent, now);
    if (divider) {
      state.isToday = divider === "today";
    }
  }
  return state;
}

const SYSTEM_NOTICE_PATTERN = /cifrad|encrypt|criptograf|chiffr|verschl|crittograf/i;

/** ¿Hay filas que parecen mensajes (texto que no es separador ni aviso del sistema)? */
function hasUnrecognizedMessages(panel: Element, now: Date): boolean {
  return [...panel.querySelectorAll(S.timelineRow)].some((row) => {
    const text = row.textContent.trim();
    return (
      text !== "" && classifyDayDivider(text, now) === null && !SYSTEM_NOTICE_PATTERN.test(text)
    );
  });
}

/** Identidad del chat (data-id "false_<chat>_<id>" o título), usada solo para una huella local. */
function chatIdentity(nodes: readonly Element[], panel: Element): string {
  const dataId = nodes
    .map((node) => node.getAttribute("data-id") ?? "")
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
    return { status: "no_chat", diagnostics: EMPTY_DIAGNOSTICS };
  }
  const nodes = messageNodes(panel);
  const base: ReaderDiagnostics = {
    ...EMPTY_DIAGNOSTICS,
    panelFound: true,
    messageNodes: nodes.length,
  };
  if (nodes.length === 0) {
    // Filas con texto largo que no se reconocen como mensajes: la estructura de WhatsApp cambió.
    // Un chat vacío (solo el aviso de cifrado o separadores) se lee normalmente, sin mensajes.
    return hasUnrecognizedMessages(panel, now)
      ? { status: "unreadable", diagnostics: base }
      : {
          status: "reading",
          snapshot: { chatKey: fingerprint(chatIdentity([], panel)), messages: [] },
          diagnostics: base,
        };
  }
  if (isGroupChat(nodes)) {
    return { status: "group", diagnostics: base };
  }
  const { messages, diagnostics } = readTimeline(panel, nodes, now);
  return {
    status: "reading",
    snapshot: {
      chatKey: fingerprint(chatIdentity(nodes, panel)),
      messages: messages.slice(-MAX_MESSAGES_PER_SNAPSHOT),
    },
    diagnostics,
  };
}
