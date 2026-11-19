import { messages } from "@yigora/i18n";
import type { ConversationMessage, SuggestionResult } from "@yigora/suggestion-engine";
import { Badge, Button } from "@yigora/ui";
import type { OverlayState } from "../../shared/overlay-state";
import { MessageComposer } from "./MessageComposer";
import { Section } from "./Section";

interface ConversationCardProps {
  readonly state: OverlayState;
  readonly onAdd: (text: string) => void;
  readonly onClear: () => void;
}

const languageName = (code: string | null): string | null => {
  const names: Record<string, string> = messages.languages;
  return code ? (names[code] ?? code) : null;
};

/** Mensajes del cliente unidos en un solo bloque: la conversación se entiende como un todo. */
function customerBlock(
  conversation: readonly ConversationMessage[],
  customerText: string | undefined,
): string {
  if (customerText) {
    return customerText;
  }
  return conversation
    .filter((message) => message.direction === "incoming")
    .map((message) => message.text)
    .join("\n");
}

function emptyText(state: OverlayState): string {
  const t = messages.overlay;
  if (state.reader !== "reading") {
    return t.reader[state.reader];
  }
  // Leyendo el chat de WhatsApp sin mensajes del cliente hoy, o vista vacía tras "Limpiar".
  return state.source === "whatsapp" ? t.noMessagesToday : t.emptyConversation;
}

interface HeaderProps {
  readonly source: OverlayState["source"];
  readonly language: string | null;
  readonly canClear: boolean;
  readonly onClear: () => void;
}

function ConversationHeader({ source, language, canClear, onClear }: HeaderProps) {
  const t = messages.overlay;
  return (
    <div className="flex items-center gap-1.5">
      {source && (
        <Badge tone="neutral">{source === "whatsapp" ? t.sourceWhatsApp : t.sourceManual}</Badge>
      )}
      {language && <Badge tone="primary">{language}</Badge>}
      {canClear && (
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={onClear}>
          {t.clear}
        </Button>
      )}
    </div>
  );
}

/** Resumen de lo que pide el cliente y traducción (si existe). */
function ResultNotes({ result }: { result: SuggestionResult }) {
  const t = messages.overlay;
  return (
    <>
      <p className="mt-2 text-xs text-muted-foreground" data-testid="summary">
        <span className="font-semibold">{t.summary}:</span> {result.summaryEs}
        {result.awaitingCustomer && ` · ${t.awaitingCustomer}`}
      </p>
      {result.translationEs && (
        <p className="mt-1 text-xs">
          <span className="font-semibold">{t.translation}:</span> {result.translationEs}
        </p>
      )}
    </>
  );
}

export function ConversationCard({ state, onAdd, onClear }: ConversationCardProps) {
  const t = messages.overlay;
  const okResult = state.result?.status === "ok" ? state.result : null;
  const block = customerBlock(state.conversation, okResult?.customerText);
  const language = okResult ? languageName(okResult.detectedLanguage) : null;

  return (
    <Section
      title={t.conversation}
      aside={
        <ConversationHeader
          source={state.source}
          language={language}
          canClear={block !== ""}
          onClear={onClear}
        />
      }
    >
      {block !== "" ? (
        <p
          className="max-h-40 overflow-y-auto whitespace-pre-line rounded-md bg-muted px-3 py-2 text-sm leading-relaxed"
          data-testid="conversation"
        >
          {block}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground" data-testid="conversation-empty">
          {emptyText(state)}
        </p>
      )}
      {okResult && <ResultNotes result={okResult} />}
      <MessageComposer onAdd={onAdd} />
    </Section>
  );
}
