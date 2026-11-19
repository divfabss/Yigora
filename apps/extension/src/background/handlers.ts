import type { ConversationMessage } from "@yigora/suggestion-engine";
import type { ChatSnapshot, ReaderStatus, ReplyLanguage } from "../shared/messages";
import type { OverlayState } from "../shared/overlay-state";
import type { Session } from "./session-registry";
import type { SuggestionService } from "./suggestion-service";

const ANALYSIS_ERROR = "No se pudo generar la sugerencia. Intente de nuevo.";

export function publish(session: Session, patch: Partial<OverlayState>): void {
  session.state = { ...session.state, ...patch };
  session.port?.postMessage({ type: "state", state: session.state });
}

async function analyzeAndPublish(
  session: Session,
  service: SuggestionService,
  source: OverlayState["source"],
): Promise<void> {
  if (!session.messages) {
    return;
  }
  try {
    const result = await service.analyze(session.messages, session.state.replyLanguage);
    publish(session, { result, source, error: null, isDemo: service.isDemo });
  } catch {
    // No se registra el contenido del mensaje: solo se informa el fallo en la interfaz.
    publish(session, { error: ANALYSIS_ERROR });
  }
}

export async function handleSnapshot(
  session: Session,
  snapshot: ChatSnapshot,
  service: SuggestionService,
) {
  if (snapshot.chatKey !== session.chatKey) {
    session.chatKey = snapshot.chatKey;
    session.state = { ...session.state, replyLanguage: null };
  }
  session.messages = snapshot.messages;
  publish(session, { reader: "reading" });
  await analyzeAndPublish(session, service, "whatsapp");
}

export function handleStatus(session: Session, status: ReaderStatus): void {
  // Al salir del chat (o abrir un grupo) se borra lo leído; en pausa se conserva el último análisis.
  if (status !== "reading" && status !== "paused" && session.state.source === "whatsapp") {
    session.messages = null;
    session.chatKey = null;
    publish(session, { reader: status, result: null, source: null });
    return;
  }
  publish(session, { reader: status });
}

export async function handleManual(session: Session, text: string, service: SuggestionService) {
  const message: ConversationMessage = { direction: "incoming", text };
  session.messages = [message];
  await analyzeAndPublish(session, service, "manual");
}

export async function handleReplyLanguage(
  session: Session,
  language: ReplyLanguage,
  service: SuggestionService,
) {
  session.state = { ...session.state, replyLanguage: language };
  await analyzeAndPublish(session, service, session.state.source);
}
