import {
  contentMessageSchema,
  OVERLAY_PORT_NAME,
  overlayMessageSchema,
  type BackgroundToContent,
} from "../shared/messages";
import {
  handleAdd,
  handleClear,
  handleReplyLanguage,
  handleSnapshot,
  handleStatus,
  publish,
} from "./handlers";
import { createSessionRegistry, type Session } from "./session-registry";
import { createDemoSuggestionService } from "./suggestion-service";

/**
 * Service worker: enruta mensajes entre el lector de WhatsApp y la ventana flotante, y ejecuta
 * el servicio de sugerencias. Valida el origen y la forma de cada mensaje recibido.
 */
const WHATSAPP_ORIGIN = "https://web.whatsapp.com/";
const service = createDemoSuggestionService();
const registry = createSessionRegistry();

function isFromWhatsAppContentScript(sender: chrome.runtime.MessageSender): boolean {
  return (
    sender.id === chrome.runtime.id &&
    typeof sender.tab?.id === "number" &&
    (sender.url ?? "").startsWith(WHATSAPP_ORIGIN)
  );
}

function isFromOverlay(sender: chrome.runtime.MessageSender | undefined): boolean {
  return (
    sender?.id === chrome.runtime.id &&
    (sender.url ?? "").startsWith(chrome.runtime.getURL("overlay.html"))
  );
}

function tellContent(session: Session, message: BackgroundToContent): void {
  if (session.tabId !== null) {
    chrome.tabs.sendMessage(session.tabId, message).catch(() => undefined);
  }
}

chrome.runtime.onMessage.addListener((raw: unknown, sender) => {
  const parsed = contentMessageSchema.safeParse(raw);
  if (!parsed.success || !isFromWhatsAppContentScript(sender)) {
    return;
  }
  const session = registry.get(parsed.data.sessionId);
  session.tabId = sender.tab?.id ?? null;
  if (parsed.data.type === "reader.snapshot") {
    void handleSnapshot(session, parsed.data.snapshot, parsed.data.diagnostics, service);
  } else {
    handleStatus(session, parsed.data.status, parsed.data.diagnostics);
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== OVERLAY_PORT_NAME || !isFromOverlay(port.sender)) {
    port.disconnect();
    return;
  }
  let session: Session | null = null;
  port.onMessage.addListener((raw: unknown) => {
    const parsed = overlayMessageSchema.safeParse(raw);
    if (!parsed.success) {
      return;
    }
    const message = parsed.data;
    if (message.type === "overlay.ready") {
      session = registry.get(message.sessionId);
      session.port = port;
      publish(session, {});
      tellContent(session, { type: "reader.resend" });
    } else if (session && message.type === "conversation.add") {
      void handleAdd(session, message.text, service);
    } else if (session && message.type === "conversation.clear") {
      handleClear(session);
    } else if (session && message.type === "reply.language") {
      void handleReplyLanguage(session, message.language, service);
    }
    // "overlay.ping" no requiere respuesta: recibirlo ya reinicia el temporizador de inactividad.
  });
  port.onDisconnect.addListener(() => {
    if (session?.port === port) {
      session.port = null;
    }
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id !== undefined && (tab.url ?? "").startsWith(WHATSAPP_ORIGIN)) {
    chrome.tabs
      .sendMessage(tab.id, { type: "overlay.toggle" } satisfies BackgroundToContent)
      .catch(() => undefined);
    return;
  }
  void chrome.tabs.create({ url: WHATSAPP_ORIGIN });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  registry.removeTab(tabId);
});
