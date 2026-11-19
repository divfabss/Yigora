import { messages } from "@yigora/i18n";
import { Badge } from "@yigora/ui";
import type { SuggestionResult } from "@yigora/suggestion-engine";
import { Section } from "./Section";

const languageName = (code: string | null): string => {
  const names: Record<string, string> = messages.languages;
  return code ? (names[code] ?? code) : messages.overlay.languageUnknown;
};

export function CustomerMessage({ result, manual }: { result: SuggestionResult; manual: boolean }) {
  const t = messages.overlay;
  const confidence = result.detectedLanguage
    ? ` · ${Math.round(result.languageConfidence * 100)}%`
    : "";
  return (
    <Section
      title={manual ? t.manualSource : t.customerMessage}
      aside={
        <Badge tone="primary">{`${languageName(result.detectedLanguage)}${confidence}`}</Badge>
      }
    >
      <p className="line-clamp-4 whitespace-pre-line text-sm" data-testid="customer-text">
        {result.customerText}
      </p>
      {result.awaitingCustomer && (
        <p className="mt-2 text-xs text-muted-foreground">{t.awaitingCustomer}</p>
      )}
      {result.detectedLanguage !== "es" && (
        <div className="mt-3 border-t pt-2">
          <p className="text-xs font-semibold text-muted-foreground">{t.translation}</p>
          {result.translationEs ? (
            <p className="text-sm">{result.translationEs}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{t.translationPending}</p>
          )}
        </div>
      )}
      <div className="mt-3 border-t pt-2">
        <p className="text-xs font-semibold text-muted-foreground">{t.summary}</p>
        <p className="text-sm" data-testid="summary">
          {result.summaryEs}
        </p>
      </div>
    </Section>
  );
}
