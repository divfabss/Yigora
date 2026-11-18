import { z } from "zod";

/**
 * Esquema de variables de entorno del servidor. Se valida al primer uso para fallar
 * de forma explícita ante configuraciones incompletas (nunca con valores por defecto inseguros).
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  /** Solo servidor. Usada exclusivamente por flujos del administrador de plataforma. */
  SUPABASE_SECRET_KEY: z.string().min(20).optional(),
  /** Solo servidor. Opcional: sin clave, el motor usa respuestas deterministas. */
  ANTHROPIC_API_KEY: z.string().min(20).optional(),
  AI_MODEL: z.string().min(1).default("claude-haiku-5-5"),
  /** Origen de la extensión de Chrome autorizada (chrome-extension://<id>). */
  EXTENSION_ORIGIN: z
    .string()
    .regex(/^chrome-extension:\/\/[a-p]{32}$/, "EXTENSION_ORIGIN inválido")
    .optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class InvalidEnvironmentError extends Error {
  constructor(public readonly invalidKeys: readonly string[]) {
    // Solo se informan los nombres de las variables, nunca sus valores.
    super(`Variables de entorno inválidas o faltantes: ${invalidKeys.join(", ")}`);
    this.name = "InvalidEnvironmentError";
  }
}

export function parseServerEnv(raw: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(raw);
  if (!result.success) {
    const keys = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
    throw new InvalidEnvironmentError(keys);
  }
  return result.data;
}
