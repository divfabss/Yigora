import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Verificación de disponibilidad. No expone versiones ni configuración. */
export function GET() {
  return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
