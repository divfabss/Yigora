/**
 * Diagnóstico en la consola del navegador (Herramientas para desarrolladores → Consola).
 * Regla: NUNCA registrar contenido de mensajes, nombres ni teléfonos; solo estados y conteos.
 */
type DiagnosticValue = string | number | boolean;

export function logDiagnostic(event: string, detail: Record<string, DiagnosticValue> = {}): void {
  // eslint-disable-next-line no-console -- único punto de registro de la extensión, sin datos personales
  console.info(`[Yigora] ${event}`, detail);
}
