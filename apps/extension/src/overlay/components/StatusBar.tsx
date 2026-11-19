import { messages } from "@yigora/i18n";
import { Button, cn } from "@yigora/ui";
import type { ReaderStatus } from "../../shared/messages";

const DOT_COLORS: Record<ReaderStatus, string> = {
  reading: "bg-success",
  paused: "bg-warning",
  no_chat: "bg-muted-foreground",
  group: "bg-muted-foreground",
  unreadable: "bg-danger",
};

interface StatusBarProps {
  readonly reader: ReaderStatus;
  readonly connected: boolean;
  readonly onTogglePause: () => void;
}

export function StatusBar({ reader, connected, onTogglePause }: StatusBarProps) {
  const t = messages.overlay;
  const label = connected ? t.reader[reader] : t.disconnected;
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          connected ? DOT_COLORS[reader] : "bg-warning",
        )}
      />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <Button size="sm" variant="outline" onClick={onTogglePause} disabled={!connected}>
        {reader === "paused" ? t.resume : t.pause}
      </Button>
    </div>
  );
}
