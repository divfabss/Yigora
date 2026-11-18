import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, generateNonce } from "./csp";

describe("generateNonce", () => {
  it("genera valores distintos y suficientemente largos", () => {
    const first = generateNonce();
    expect(first).not.toBe(generateNonce());
    expect(first.length).toBeGreaterThanOrEqual(22);
  });
});

describe("buildContentSecurityPolicy", () => {
  const base = { nonce: "abc123", connectSources: ["https://proyecto.supabase.co"] };

  it("incluye el nonce y bloquea objetos y marcos", () => {
    const policy = buildContentSecurityPolicy({ ...base, isDevelopment: false });
    expect(policy).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("connect-src 'self' https://proyecto.supabase.co");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("solo permite unsafe-eval en desarrollo", () => {
    expect(buildContentSecurityPolicy({ ...base, isDevelopment: false })).not.toContain(
      "unsafe-eval",
    );
    expect(buildContentSecurityPolicy({ ...base, isDevelopment: true })).toContain("'unsafe-eval'");
  });

  it("nunca permite unsafe-inline", () => {
    expect(buildContentSecurityPolicy({ ...base, isDevelopment: true })).not.toContain(
      "unsafe-inline",
    );
  });
});
