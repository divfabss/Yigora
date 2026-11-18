/**
 * Construcción de la Content-Security-Policy con nonce por petición.
 * Basado en la guía oficial de Next.js 16 (docs/01-app/02-guides/content-security-policy.md).
 */
export interface CspOptions {
  readonly nonce: string;
  readonly isDevelopment: boolean;
  /** Orígenes adicionales permitidos en connect-src (p. ej. la URL de Supabase). */
  readonly connectSources: readonly string[];
}

export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function buildContentSecurityPolicy({
  nonce,
  isDevelopment,
  connectSources,
}: CspOptions): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // React usa eval solo en desarrollo para depuración.
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", `'nonce-${nonce}'`],
    "img-src": ["'self'", "blob:", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...connectSources],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives)
    .map(([directive, values]) => `${directive} ${values.join(" ")}`)
    .join("; ");

  return isDevelopment ? policy : `${policy}; upgrade-insecure-requests`;
}
