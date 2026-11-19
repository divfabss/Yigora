import type { ChatSnapshot, ReaderStatus } from "../../shared/messages";
import { fingerprint } from "./hash";
import { readOpenChat } from "./read-conversation";

export interface WatchOptions {
  readonly doc: Document;
  readonly isPaused: () => boolean;
  readonly onSnapshot: (snapshot: ChatSnapshot) => void;
  readonly onStatus: (status: ReaderStatus) => void;
  readonly now?: () => Date;
  /** Intervalo mínimo entre lecturas. */
  readonly intervalMs?: number;
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
  const { doc, isPaused, onSnapshot, onStatus, now = () => new Date(), intervalMs = 700 } = options;
  let lastSignature = "";
  let lastStatus: ReaderStatus | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastRun = 0;

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

  /**
   * Limitación (throttle), no espera (debounce): WhatsApp cambia la página continuamente
   * ("en línea", "escribiendo…"); con una espera que se reinicia, la lectura podría no ocurrir nunca.
   * Así se garantiza una lectura como máximo cada `intervalMs`.
   */
  const schedule = () => {
    if (timer !== undefined) {
      return;
    }
    const wait = Math.max(0, lastRun + intervalMs - Date.now());
    timer = setTimeout(() => {
      timer = undefined;
      lastRun = Date.now();
      evaluate();
    }, wait);
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
