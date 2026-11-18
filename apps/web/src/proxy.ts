import { NextResponse, type NextRequest } from "next/server";
import { buildContentSecurityPolicy, generateNonce } from "./server/security/csp";

/**
 * Proxy de Next.js 16: aplica la CSP con nonce por petición.
 * (La renovación de sesión de Supabase se agregará con la autenticación en la Fase 2.)
 */
export function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const csp = buildContentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV === "development",
    connectSources: supabaseUrl ? [new URL(supabaseUrl).origin] : [],
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
