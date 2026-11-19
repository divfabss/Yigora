import type { ConversationMessage } from "@yigora/suggestion-engine";
import type {
  ChatSnapshot,
  ReaderDiagnostics,
  ReaderStatus,
  ReplyLanguage,
} from "../shared/messages";
import type { OverlayState } from "../shared/overlay-state";
import type { Session } from "./session-registry";
import type { SuggestionService } from "./suggestion-service";

const ANALYSIS_ERROR = "No se pudo generar la sugerencia. Intente de nuevo.";
const MAX_MANUAL_MESSAGES = 20;

export function publish(session: Session, patch: Partial<OverlayState>): void {
  session.state = { ...session.state, ...patch };
  session.port?.postMessage({ type: "state", state: session.state });
}

const signatureOf = (messages: readonly ConversationMessage[]): string => JSON.stringify(messages);

/** Analiza TODA la conversación como un solo contexto y publica el resultado. */
async function analyzeAndPublish(
  session: Session,
  service: SuggestionService,
  source: OverlayState["source"],
): Promise<void> {
  const messages = session.messages ?? [];
  if (!messages.some((message) => message.direction === "incoming")) {
    publish(session, { result: null, conversation: messages, source, error: null });
    return;
  }
  try {
    const result = await service.analyze(messages, session.state.replyLanguage);
    publish(session, {
      result,
      conversation: messages,
      source,
      error: null,
      isDemo: service.isDemo,
    });
  } catch {
    // No se registra el contenido del mensaje: solo se informa el fallo en la interfaz.
    publish(session, { error: ANALYSIS_ERROR });
  }
}

export async function handleSnapshot(
  session: Session,
  snapshot: ChatSnapshot,
  diagnostics: ReaderDiagnostics,
  service: SuggestionService,
) {
  const sameChat = snapshot.chatKey === session.chatKey;
  // En el mismo chat, lo que el vendedor agregó a mano tiene prioridad hasta que pulse "Limpiar".
  if (sameChat && session.state.source === "manual") {
    publish(session, { reader: "reading", diagnostics });
    return;
  }
  if (!sameChat) {
    session.chatKey = snapshot.chatKey;
    session.clearedSignature = null;
    session.state = { ...session.state, replyLanguage: null };
  }
  // Tras "Limpiar", no se vuelve a mostrar la misma conversación hasta que llegue algo nuevo.
  if (session.clearedSignature === signatureOf(snapshot.messages)) {
    publish(session, { reader: "reading", diagnostics });
    return;
  }
  session.clearedSignature = null;
  session.messages = snapshot.messages;
  publish(session, { reader: "reading", diagnostics });
  await analyzeAndPublish(session, service, "whatsapp");
}

export function handleStatus(
  session: Session,
  status: ReaderStatus,
  diagnostics: ReaderDiagnostics,
): void {
  // Al salir del chat (o abrir un grupo) se borra lo leído; en pausa se conserva el último análisis.
  if (status !== "reading" && status !== "paused" && session.state.source === "whatsapp") {
    session.messages = null;
    session.chatKey = null;
    publish(session, { reader: status, diagnostics, result: null, conversation: [], source: null });
    return;
  }
  publish(session, { reader: status, diagnostics });
}

/** Agrega un mensaje del cliente a la conversación manual y la analiza completa. */
export async function handleAdd(session: Session, text: string, service: SuggestionService) {
  const previous = session.state.source === "manual" ? (session.messages ?? []) : [];
  const message: ConversationMessage = { direction: "incoming", text };
  session.messages = [...previous, message].slice(-MAX_MANUAL_MESSAGES);
  await analyzeAndPublish(session, service, "manual");
}

export function handleClear(session: Session): void {
  if (session.state.source === "whatsapp" && session.messages) {
    session.clearedSignature = signatureOf(session.messages);
  }
  session.messages = null;
  publish(session, { result: null, conversation: [], source: null, error: null });
}

export async function handleReplyLanguage(
  session: Session,
  language: ReplyLanguage,
  service: SuggestionService,
) {
  session.state = { ...session.state, replyLanguage: language };
  await analyzeAndPublish(session, service, session.state.source);
}
