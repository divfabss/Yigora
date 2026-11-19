import {
  backgroundToContentSchema,
  PAUSE_STORAGE_KEY,
  POSITION_STORAGE_KEY,
  type ContentMessage,
} from "../shared/messages";
import { logDiagnostic } from "../shared/diagnostics";
import { mountOverlay, type OverlayPosition } from "./overlay-host/mount-overlay";
import { watchConversation } from "./whatsapp/watch-conversation";

/**
 * Content script de WhatsApp Web: monta la ventana flotante y observa el chat abierto en modo
 * de SOLO LECTURA. Nunca escribe en WhatsApp ni envía mensajes.
 */
function createSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function send(message: ContentMessage): void {
  chrome.runtime.sendMessage(message).catch(() => {
    // El service worker puede estar reiniciándose; la próxima lectura reintenta.
  });
}

async function start(): Promise<void> {
  const sessionId = createSessionId();
  const stored = await chrome.storage.local.get([PAUSE_STORAGE_KEY, POSITION_STORAGE_KEY]);
  let paused = stored[PAUSE_STORAGE_KEY] === true;
  const position = (stored[POSITION_STORAGE_KEY] as OverlayPosition | undefined) ?? null;

  const overlay = mountOverlay({
    doc: document,
    iframeUrl: `${chrome.runtime.getURL("overlay.html")}#${sessionId}`,
    initialPosition: position,
    onPositionChange: (next) => {
      void chrome.storage.local.set({ [POSITION_STORAGE_KEY]: next });
    },
  });

  logDiagnostic("ventana flotante lista", { pausado: paused });

  const watcher = watchConversation({
    doc: document,
    isPaused: () => paused,
    onSnapshot: (snapshot) => {
      logDiagnostic("chat leído", { mensajesDeHoy: snapshot.messages.length });
      send({ type: "reader.snapshot", sessionId, snapshot });
    },
    onStatus: (status) => {
      logDiagnostic("estado de lectura", { estado: status });
      send({ type: "reader.status", sessionId, status });
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
