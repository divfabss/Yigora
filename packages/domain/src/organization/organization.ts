import { z } from "zod";

export const orgRoleSchema = z.enum(["owner", "admin", "seller"]);
export type OrgRole = z.infer<typeof orgRoleSchema>;

export const accessStatusSchema = z.enum(["active", "suspended"]);
export type AccessStatus = z.infer<typeof accessStatusSchema>;

export const businessTypeSchema = z.enum(["pharmacy"]);
export type BusinessType = z.infer<typeof businessTypeSchema>;

export interface OrganizationAccess {
  readonly accessStatus: AccessStatus;
  readonly accessExpiresAt: Date | null;
}

/**
 * Refleja la condición de acceso de `app.has_org_role` en la base de datos.
 * La BD sigue siendo la autoridad; esta función sirve para mensajes de interfaz.
 */
export function hasActiveAccess(organization: OrganizationAccess, now: Date): boolean {
  if (organization.accessStatus !== "active") {
    return false;
  }
  return organization.accessExpiresAt === null || organization.accessExpiresAt > now;
}

const INVENTORY_MANAGER_ROLES: ReadonlySet<OrgRole> = new Set(["owner", "admin"]);

export function canManageInventory(role: OrgRole): boolean {
  return INVENTORY_MANAGER_ROLES.has(role);
}

export function canManageMembers(role: OrgRole): boolean {
  return role === "owner";
}
