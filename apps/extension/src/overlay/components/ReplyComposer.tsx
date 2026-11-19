import { messages } from "@yigora/i18n";
import { Button } from "@yigora/ui";
import { useRef, useState } from "react";
import { replyLanguageSchema, type ReplyLanguage } from "../../shared/messages";
import { Section } from "./Section";

interface ReplyComposerProps {
  readonly reply: string;
  readonly language: string;
  readonly onLanguageChange: (language: ReplyLanguage) => void;
}

type CopyState = "idle" | "copied" | "failed";

/**
 * Respuesta sugerida editable. Solo copia al portapapeles: el vendedor decide si la envía.
 * El padre usa `key` para reiniciar la edición cuando llega una sugerencia nueva.
 */
export function ReplyComposer({ reply, language, onLanguageChange }: ReplyComposerProps) {
  const t = messages;
  const [text, setText] = useState(reply);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      textareaRef.current?.select();
      setCopyState("failed");
    }
  };

  return (
    <Section
      title={t.overlay.reply}
      aside={
        <select
          aria-label={t.overlay.replyLanguage}
          className="h-7 rounded-md border border-input bg-card px-2 text-xs"
          value={language}
          onChange={(event) => {
            const parsed = replyLanguageSchema.safeParse(event.target.value);
            if (parsed.success) {
              onLanguageChange(parsed.data);
            }
          }}
        >
          {replyLanguageSchema.options.map((code) => (
            <option key={code} value={code}>
              {t.languages[code]}
            </option>
          ))}
        </select>
      }
    >
      <textarea
        ref={textareaRef}
        aria-label={t.overlay.reply}
        data-testid="reply"
        className="min-h-28 w-full resize-y rounded-md border border-input bg-card p-2 text-sm leading-relaxed"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setCopyState("idle");
        }}
      />
      {copyState === "failed" && (
        <p className="mt-1 text-xs text-danger">{t.overlay.copyFallback}</p>
      )}
      <Button className="mt-2 w-full" onClick={() => void copy()} disabled={text.trim() === ""}>
        {copyState === "copied" ? t.common.copied : t.common.copy}
      </Button>
    </Section>
  );
}
