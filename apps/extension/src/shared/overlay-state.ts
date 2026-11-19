import type { SuggestionResult } from "@yigora/suggestion-engine";
import type { ConversationMessage } from "@yigora/suggestion-engine";
import type { ReaderDiagnostics, ReaderStatus, ReplyLanguage } from "./messages";

/** Estado que el service worker envía a la ventana flotante. */
export interface OverlayState {
  readonly reader: ReaderStatus;
  readonly source: "whatsapp" | "manual" | null;
  readonly result: SuggestionResult | null;
  /** Mensajes de la conversación que se están analizando (de hoy o agregados a mano). */
  readonly conversation: readonly ConversationMessage[];
  readonly diagnostics: ReaderDiagnostics | null;
  readonly replyLanguage: ReplyLanguage | null;
  readonly isDemo: boolean;
  readonly error: string | null;
}

export const INITIAL_OVERLAY_STATE: OverlayState = {
  reader: "no_chat",
  source: null,
  result: null,
  conversation: [],
  diagnostics: null,
  replyLanguage: null,
  isDemo: true,
  error: null,
};

export interface StateMessage {
  readonly type: "state";
  readonly state: OverlayState;
}
