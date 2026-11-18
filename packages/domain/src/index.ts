/**
 * @yigora/domain — tipos, esquemas y reglas puras del negocio.
 * No depende de infraestructura (red, base de datos, navegador).
 */
export { normalizeText } from "./text/normalize-text";
export {
  deriveStockAvailability,
  deriveStockStatus,
  isStockInformationStale,
  type StockAvailability,
  type StockSnapshot,
  type StockStatus,
  type StockStatusOptions,
} from "./inventory/stock-status";
export {
  accessStatusSchema,
  businessTypeSchema,
  canManageInventory,
  canManageMembers,
  hasActiveAccess,
  orgRoleSchema,
  type AccessStatus,
  type BusinessType,
  type OrganizationAccess,
  type OrgRole,
} from "./organization/organization";
export {
  baseLanguage,
  INTERFACE_LOCALE,
  isPriorityLanguage,
  languageCodeSchema,
  PRIORITY_LANGUAGES,
  type LanguageCode,
  type PriorityLanguage,
} from "./language/language";
export {
  currencyCodeSchema,
  priceSchema,
  productInputSchema,
  productSchema,
  stockQuantitySchema,
  type Product,
  type ProductInput,
} from "./product/product";
