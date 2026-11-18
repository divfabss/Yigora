import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerEnv } from "../config/env";

/**
 * Cliente Supabase con la sesión del usuario actual (cookies).
 * Todas las consultas pasan por RLS con la identidad del usuario (ADR-003).
 */
export async function createSupabaseServerClient() {
  const env = getServerEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Llamado desde un Server Component: las cookies se renuevan en el proxy.
          }
        },
      },
    },
  );
}
