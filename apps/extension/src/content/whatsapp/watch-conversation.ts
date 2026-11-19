import type { ChatSnapshot, ReaderStatus } from "../../shared/messages";
import { fingerprint } from "./hash";
import { readOpenChat } from "./read-conversation";

export interface WatchOptions {
  readonly doc: Document;
  readonly isPaused: () => boolean;
  readonly onSnapshot: (snapshot: ChatSnapshot) => void;
  readonly onStatus: (status: ReaderStatus) => void;
  readonly now?: () => Date;
  readonly debounceMs?: number;
}

export interface ConversationWatcher {
  /** Vuelve a leer y emite aunque nada haya cambiado (p. ej. al reconectar la ventana). */
  refresh(): void;
  stop(): void;
}

/**
 * Observa cambios en la página (apertura de chat, mensajes nuevos) y emite una instantánea
 * solo cuando el contenido cambia. Únicamente observa: nunca modifica la página.
 */
export function watchConversation(options: WatchOptions): ConversationWatcher {
  const { doc, isPaused, onSnapshot, onStatus, now = () => new Date(), debounceMs = 600 } = options;
  let lastSignature = "";
  let lastStatus: ReaderStatus | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const emitStatus = (status: ReaderStatus) => {
    if (status !== lastStatus) {
      lastStatus = status;
      onStatus(status);
    }
  };

  const evaluate = (force = false) => {
    if (isPaused()) {
      lastSignature = "";
      emitStatus("paused");
      return;
    }
    const result = readOpenChat(doc, now());
    if (result.status !== "reading") {
      lastSignature = "";
      emitStatus(result.status);
      return;
    }
    const signature = fingerprint(JSON.stringify(result.snapshot));
    emitStatus("reading");
    if (force || signature !== lastSignature) {
      lastSignature = signature;
      onSnapshot(result.snapshot);
    }
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      evaluate();
    }, debounceMs);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(doc.body, { childList: true, subtree: true, characterData: true });
  evaluate();

  return {
    refresh: () => {
      lastStatus = null;
      evaluate(true);
    },
    stop: () => {
      clearTimeout(timer);
      observer.disconnect();
    },
  };
}
