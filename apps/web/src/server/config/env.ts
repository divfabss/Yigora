import "server-only";
import { parseServerEnv, type ServerEnv } from "./env-schema";

let cachedEnv: ServerEnv | undefined;

/** Variables de entorno del servidor, validadas una sola vez por proceso. */
export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}
