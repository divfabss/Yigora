import { describe, expect, it } from "vitest";
import { InvalidEnvironmentError, parseServerEnv } from "./env-schema";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_xxxxxxxxxxxxxxxxxxxx",
};

describe("parseServerEnv", () => {
  it("acepta la configuración mínima y aplica el modelo por defecto", () => {
    const env = parseServerEnv(valid);
    expect(env.AI_MODEL).toBe("claude-haiku-5-5");
    expect(env.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it("informa los nombres de variables inválidas sin exponer valores", () => {
    const secret = "valor-que-no-debe-aparecer";
    try {
      parseServerEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: secret });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidEnvironmentError);
      const message = (error as Error).message;
      expect(message).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(message).not.toContain(secret);
    }
  });

  it("valida el formato del origen de la extensión", () => {
    expect(() => parseServerEnv({ ...valid, EXTENSION_ORIGIN: "https://malicioso.com" })).toThrow(
      InvalidEnvironmentError,
    );
    const origin = `chrome-extension://${"a".repeat(32)}`;
    expect(parseServerEnv({ ...valid, EXTENSION_ORIGIN: origin }).EXTENSION_ORIGIN).toBe(origin);
  });
});
