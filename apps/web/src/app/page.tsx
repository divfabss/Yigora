import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@yigora/ui";
import { messages } from "@yigora/i18n";
import { connection } from "next/server";

/** Página provisional de la Fase 1. La landing definitiva llega en la Fase 2. */
export default async function HomePage() {
  // Render dinámico: necesario para aplicar el nonce de la CSP (ver src/proxy.ts).
  await connection();

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-4 py-16">
      <div className="flex items-center gap-2">
        <span aria-hidden className="size-8 rounded-lg bg-primary" />
        <span className="text-xl font-semibold tracking-tight">{messages.brand.name}</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{messages.home.underConstructionTitle}</CardTitle>
          <CardDescription>{messages.home.underConstructionBody}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge tone="success">{messages.stock.available}</Badge>
          <Badge tone="danger">{messages.stock.outOfStock}</Badge>
          <Badge tone="neutral">{messages.stock.unknown}</Badge>
          <Badge tone="warning">{messages.stock.stale}</Badge>
        </CardContent>
      </Card>
    </main>
  );
}
