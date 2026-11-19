import type { ChatSnapshot, ReaderDiagnostics, ReaderStatus } from "../../shared/messages";
import { fingerprint } from "./hash";
import { readOpenChat } from "./read-conversation";

const NO_DIAGNOSTICS: ReaderDiagnostics = {
  panelFound: false,
  messageNodes: 0,
  withDate: 0,
  today: 0,
  dateSample: null,
};

export interface WatchOptions {
  readonly doc: Document;
  readonly isPaused: () => boolean;
  readonly onSnapshot: (snapshot: ChatSnapshot, diagnostics: ReaderDiagnostics) => void;
  readonly onStatus: (status: ReaderStatus, diagnostics: ReaderDiagnostics) => void;
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

  const emitStatus = (status: ReaderStatus, diagnostics: ReaderDiagnostics) => {
    if (status !== lastStatus) {
      lastStatus = status;
      onStatus(status, diagnostics);
    }
  };

  const evaluate = (force = false) => {
    if (isPaused()) {
      lastSignature = "";
      emitStatus("paused", NO_DIAGNOSTICS);
      return;
    }
    const result = readOpenChat(doc, now());
    if (result.status !== "reading") {
      lastSignature = "";
      emitStatus(result.status, result.diagnostics);
      return;
    }
    const signature = fingerprint(JSON.stringify(result.snapshot));
    emitStatus("reading", result.diagnostics);
    if (force || signature !== lastSignature) {
      lastSignature = signature;
      onSnapshot(result.snapshot, result.diagnostics);
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
