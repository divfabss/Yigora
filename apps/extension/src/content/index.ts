import {
  backgroundToContentSchema,
  PAUSE_STORAGE_KEY,
  LAYOUT_STORAGE_KEY,
  type ContentMessage,
  type ReaderDiagnostics,
} from "../shared/messages";
import { logDiagnostic } from "../shared/diagnostics";
import { restoreLayout } from "./overlay-host/layout";
import { mountOverlay } from "./overlay-host/mount-overlay";
import { watchConversation } from "./whatsapp/watch-conversation";

/**
 * Content script de WhatsApp Web: monta la ventana flotante y observa el chat abierto en modo
 * de SOLO LECTURA. Nunca escribe en WhatsApp ni envía mensajes.
 */
function createSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Diagnóstico en formato plano para la consola (sin contenido de mensajes). */
function flatten(diagnostics: ReaderDiagnostics): Record<string, string | number | boolean> {
  return { ...diagnostics, dateSample: diagnostics.dateSample ?? "" };
}

function send(message: ContentMessage): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // El service worker puede estar reiniciándose; la próxima lectura reintenta.
  });
}

async function start(): Promise<void> {
  const sessionId = createSessionId();
  const stored = await chrome.storage.local.get([PAUSE_STORAGE_KEY, LAYOUT_STORAGE_KEY]);
  let paused = stored[PAUSE_STORAGE_KEY] === true;

  const overlay = mountOverlay({
    doc: document,
    iframeUrl: `${chrome.runtime.getURL("overlay.html")}#${sessionId}`,
    initialLayout: restoreLayout(stored[LAYOUT_STORAGE_KEY], window),
    onLayoutChange: (next) => {
      void chrome.storage.local.set({ [LAYOUT_STORAGE_KEY]: next });
    },
  });

  logDiagnostic("ventana flotante lista", { pausado: paused });

  const watcher = watchConversation({
    doc: document,
    isPaused: () => paused,
    onSnapshot: (snapshot, diagnostics) => {
      logDiagnostic("chat leído", {
        mensajesDeHoy: snapshot.messages.length,
        ...flatten(diagnostics),
      });
      send({ type: "reader.snapshot", sessionId, snapshot, diagnostics });
    },
    onStatus: (status, diagnostics) => {
      logDiagnostic("estado de lectura", { estado: status, ...flatten(diagnostics) });
      send({ type: "reader.status", sessionId, status, diagnostics });
    },
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    const change = changes[PAUSE_STORAGE_KEY];
    if (area === "local" && change) {
      paused = change.newValue === true;
      watcher.refresh();
    }
  });

  chrome.runtime.onMessage.addListener((raw: unknown, sender) => {
    const parsed = backgroundToContentSchema.safeParse(raw);
    if (sender.id !== chrome.runtime.id || !parsed.success) {
      return;
    }
    if (parsed.data.type === "overlay.toggle") {
      overlay.toggle();
    } else {
      watcher.refresh();
    }
  });
}

start().catch((error: unknown) => {
  logDiagnostic("no se pudo iniciar", {
    error: error instanceof Error ? error.name : "desconocido",
  });
});
