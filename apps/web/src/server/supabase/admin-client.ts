import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "../config/env";

/**
 * Cliente con la clave secreta (omite RLS). USO RESTRINGIDO (ADR-003):
 * solo flujos del administrador de plataforma que la API de Auth exige con privilegios,
 * como invitar usuarios. Quien lo use debe verificar antes que el usuario sea
 * administrador de plataforma. Nunca usarlo para leer o escribir datos de empresas.
 */
export function createSupabaseAdminClient() {
  const env = getServerEnv();
  if (!env.SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_SECRET_KEY no está configurada");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
