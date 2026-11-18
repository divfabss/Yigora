/**
 * Cabeceras de seguridad estáticas aplicadas a todas las respuestas.
 * La Content-Security-Policy es dinámica (nonce por petición) y se aplica en `src/proxy.ts`.
 */
export const STATIC_SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
] as const satisfies ReadonlyArray<{ key: string; value: string }>;
