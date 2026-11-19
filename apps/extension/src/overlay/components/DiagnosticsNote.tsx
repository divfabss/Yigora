import { messages } from "@yigora/i18n";
import type { ReaderDiagnostics } from "../../shared/messages";

/** Diagnóstico SIN contenido de mensajes: ayuda a ajustar el lector si WhatsApp cambia. */
export function DiagnosticsNote({ diagnostics }: { diagnostics: ReaderDiagnostics }) {
  const t = messages.overlay;
  const rows: [string, string][] = [
    [t.diagnosticsPanel, diagnostics.panelFound ? t.yes : t.no],
    [t.diagnosticsMessages, String(diagnostics.messageNodes)],
    [t.diagnosticsWithDate, String(diagnostics.withDate)],
    [t.diagnosticsToday, String(diagnostics.today)],
  ];
  if (diagnostics.dateSample) {
    rows.push([t.diagnosticsDateSample, `“${diagnostics.dateSample}”`]);
  }
  return (
    <section
      className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-xs"
      data-testid="diagnostics"
    >
      <h2 className="mb-1 font-semibold">{t.diagnosticsTitle}</h2>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd className="text-right font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-muted-foreground">{t.diagnosticsHelp}</p>
    </section>
  );
}
