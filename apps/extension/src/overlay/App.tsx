import { messages } from "@yigora/i18n";
import { PAUSE_STORAGE_KEY } from "../shared/messages";
import { CustomerMessage } from "./components/CustomerMessage";
import { ManualInput } from "./components/ManualInput";
import { ProductList } from "./components/ProductList";
import { ReplyComposer } from "./components/ReplyComposer";
import { SellerTips } from "./components/SellerTips";
import { StatusBar } from "./components/StatusBar";
import { useOverlayConnection } from "./use-overlay-connection";

export function App({ sessionId }: { sessionId: string }) {
  const t = messages.overlay;
  const { state, connected, send } = useOverlayConnection(sessionId);
  const { result } = state;
  const hasSuggestion = result?.status === "ok";

  const togglePause = () => {
    void chrome.storage.local.set({ [PAUSE_STORAGE_KEY]: state.reader !== "paused" });
  };

  return (
    <main className="flex min-h-dvh flex-col gap-3 p-3">
      <StatusBar reader={state.reader} connected={connected} onTogglePause={togglePause} />
      {state.isDemo && (
        <p className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
          {t.demoNotice}
        </p>
      )}
      {state.error && (
        <p className="rounded-md bg-danger-soft px-2 py-1 text-xs text-danger">{state.error}</p>
      )}
      {result?.status === "no_customer_message" && (
        <p className="text-sm text-muted-foreground">{t.noMessagesToday}</p>
      )}
      {hasSuggestion && (
        <>
          <CustomerMessage result={result} manual={state.source === "manual"} />
          <ReplyComposer
            key={`${result.replyLanguage}:${result.reply}`}
            reply={result.reply}
            language={result.replyLanguage}
            onLanguageChange={(language) => {
              send({ type: "reply.language", language });
            }}
          />
          <ProductList products={result.products} />
          <SellerTips tips={result.sellerTipsEs} />
        </>
      )}
      <ManualInput
        defaultOpen={state.reader === "unreadable" || state.reader === "group"}
        onAnalyze={(text) => {
          send({ type: "analyze.manual", text });
        }}
      />
      <p className="mt-auto text-center text-xs text-muted-foreground">{t.neverSends}</p>
    </main>
  );
}
