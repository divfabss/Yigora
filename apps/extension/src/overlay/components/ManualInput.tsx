import { messages } from "@yigora/i18n";
import { Button } from "@yigora/ui";
import { useState } from "react";
import { MAX_MESSAGE_LENGTH } from "../../shared/messages";

/** Respaldo manual: el vendedor pega el mensaje si la lectura automática no está disponible. */
export function ManualInput({
  onAnalyze,
  defaultOpen,
}: {
  onAnalyze: (text: string) => void;
  defaultOpen: boolean;
}) {
  const t = messages.overlay;
  const [text, setText] = useState("");
  return (
    <details className="rounded-lg border bg-card p-3 shadow-card" open={defaultOpen}>
      <summary className="cursor-pointer text-sm font-medium">{t.manualTitle}</summary>
      <textarea
        aria-label={t.manualTitle}
        className="mt-2 min-h-20 w-full resize-y rounded-md border border-input bg-card p-2 text-sm"
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder={t.manualPlaceholder}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
      <Button
        className="mt-2 w-full"
        variant="secondary"
        disabled={text.trim() === ""}
        onClick={() => {
          onAnalyze(text.trim());
        }}
      >
        {t.analyze}
      </Button>
    </details>
  );
}
