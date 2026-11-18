import { describe, expect, it } from "vitest";
import { canManageInventory, canManageMembers, hasActiveAccess } from "./organization";

const now = new Date("2026-11-18T12:00:00Z");

describe("hasActiveAccess", () => {
  it("permite organizaciones activas sin vencimiento", () => {
    expect(hasActiveAccess({ accessStatus: "active", accessExpiresAt: null }, now)).toBe(true);
  });

  it("bloquea organizaciones suspendidas", () => {
    expect(hasActiveAccess({ accessStatus: "suspended", accessExpiresAt: null }, now)).toBe(false);
  });

  it("bloquea accesos vencidos", () => {
    const expired = {
      accessStatus: "active" as const,
      accessExpiresAt: new Date("2026-11-18T11:59:59Z"),
    };
    expect(hasActiveAccess(expired, now)).toBe(false);
  });
});

describe("permisos por rol", () => {
  it("solo owner y admin administran inventario", () => {
    expect(canManageInventory("owner")).toBe(true);
    expect(canManageInventory("admin")).toBe(true);
    expect(canManageInventory("seller")).toBe(false);
  });

  it("solo owner administra miembros", () => {
    expect(canManageMembers("owner")).toBe(true);
    expect(canManageMembers("admin")).toBe(false);
  });
});
