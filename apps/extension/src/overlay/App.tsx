import { PAUSE_STORAGE_KEY } from "../shared/messages";
import { ConversationCard } from "./components/ConversationCard";
import { DiagnosticsNote } from "./components/DiagnosticsNote";
import { ProductList } from "./components/ProductList";
import { ReplyComposer } from "./components/ReplyComposer";
import { StatusBar } from "./components/StatusBar";
import { useOverlayConnection } from "./use-overlay-connection";

/** El diagnóstico solo aparece cuando la lectura automática no encuentra mensajes de hoy. */
function shouldShowDiagnostics(state: ReturnType<typeof useOverlayConnection>["state"]): boolean {
  const { diagnostics, reader, source, conversation } = state;
  if (!diagnostics || source === "manual") {
    return false;
  }
  const noCustomerToday = !conversation.some((message) => message.direction === "incoming");
  return (
    reader === "unreadable" ||
    (reader === "reading" && noCustomerToday && diagnostics.messageNodes > 0)
  );
}

/**
 * Ventana flotante: arriba la conversación (mensajes de hoy o agregados a mano) y abajo las
 * sugerencias (respuesta e inventario).
 */
export function App({ sessionId }: { sessionId: string }) {
  const { state, connected, send } = useOverlayConnection(sessionId);
  const { result } = state;

  const togglePause = () => {
    void chrome.storage.local.set({ [PAUSE_STORAGE_KEY]: state.reader !== "paused" });
  };

  return (
    <main className="flex h-dvh flex-col">
      <div className="border-b bg-card px-3 py-2">
        <StatusBar reader={state.reader} connected={connected} onTogglePause={togglePause} />
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {state.error && (
          <p className="rounded-md bg-danger-soft px-2 py-1 text-xs text-danger">{state.error}</p>
        )}
        <ConversationCard
          state={state}
          onAdd={(text) => {
            send({ type: "conversation.add", text });
          }}
          onClear={() => {
            send({ type: "conversation.clear" });
          }}
        />
        {shouldShowDiagnostics(state) && state.diagnostics && (
          <DiagnosticsNote diagnostics={state.diagnostics} />
        )}
        {result?.status === "ok" && (
          <>
            <ReplyComposer
              key={`${result.replyLanguage}:${result.reply}`}
              reply={result.reply}
              language={result.replyLanguage}
              onLanguageChange={(language) => {
                send({ type: "reply.language", language });
              }}
            />
            <ProductList products={result.products} tips={result.sellerTipsEs} />
          </>
        )}
      </div>
    </main>
  );
}
