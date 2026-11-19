import { messages } from "@yigora/i18n";
import { Button } from "@yigora/ui";
import { useState } from "react";
import { MAX_MESSAGE_LENGTH } from "../../shared/messages";

/** Agregar un mensaje del cliente a mano. El campo se vacía solo al agregar. */
export function MessageComposer({ onAdd }: { onAdd: (text: string) => void }) {
  const t = messages.overlay;
  const [text, setText] = useState("");
  const submit = () => {
    const clean = text.trim();
    if (clean !== "") {
      onAdd(clean);
      setText("");
    }
  };
  return (
    <div className="mt-3 flex items-end gap-2">
      <textarea
        aria-label={t.addPlaceholder}
        title={t.addHint}
        rows={2}
        maxLength={MAX_MESSAGE_LENGTH}
        className="min-h-10 flex-1 resize-none rounded-md border border-input bg-card px-2 py-1.5 text-sm"
        placeholder={t.addPlaceholder}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <Button size="sm" variant="secondary" disabled={text.trim() === ""} onClick={submit}>
        {t.add}
      </Button>
    </div>
  );
}
