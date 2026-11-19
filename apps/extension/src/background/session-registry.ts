import type { ConversationMessage } from "@yigora/suggestion-engine";
import { INITIAL_OVERLAY_STATE, type OverlayState } from "../shared/overlay-state";

/**
 * Estado por pestaña de WhatsApp, SOLO en memoria del service worker. No se persiste ninguna
 * conversación: si el service worker se reinicia, se pide al content script que vuelva a leer.
 */
export interface Session {
  tabId: number | null;
  chatKey: string | null;
  messages: readonly ConversationMessage[] | null;
  state: OverlayState;
  port: chrome.runtime.Port | null;
}

export function createSessionRegistry() {
  const sessions = new Map<string, Session>();

  const get = (sessionId: string): Session => {
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        tabId: null,
        chatKey: null,
        messages: null,
        state: INITIAL_OVERLAY_STATE,
        port: null,
      };
      sessions.set(sessionId, session);
    }
    return session;
  };

  const removeTab = (tabId: number) => {
    for (const [sessionId, session] of sessions) {
      if (session.tabId === tabId) {
        sessions.delete(sessionId);
      }
    }
  };

  return { get, removeTab };
}

export type SessionRegistry = ReturnType<typeof createSessionRegistry>;
