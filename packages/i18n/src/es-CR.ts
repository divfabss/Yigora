/**
 * Catálogo de textos de interfaz en español de Costa Rica.
 * Toda cadena visible para el usuario debe venir de aquí (no escribir textos sueltos en componentes).
 */
export const esCR = {
  brand: {
    name: "Yigora",
    tagline: "Tu asistente de ventas para WhatsApp",
  },
  common: {
    loading: "Cargando…",
    retry: "Reintentar",
    copy: "Copiar",
    copied: "Copiado",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
  },
  stock: {
    available: "Disponible",
    outOfStock: "Sin existencias",
    unknown: "Stock desconocido",
    stale: "Información desactualizada",
  },
  errors: {
    generic: "Ocurrió un error inesperado. Intente de nuevo.",
    unauthorized: "Su sesión expiró. Inicie sesión de nuevo.",
    forbidden: "No tiene permiso para realizar esta acción.",
    accessSuspended:
      "El acceso de su empresa está suspendido. Contacte al administrador de Yigora.",
    notFound: "No encontramos lo que busca.",
    rateLimited: "Demasiadas solicitudes. Espere un momento e intente de nuevo.",
  },
  home: {
    underConstructionTitle: "Yigora está en construcción",
    underConstructionBody: "Estamos preparando la plataforma. El acceso es solo por invitación.",
  },
} as const;

export type Messages = typeof esCR;
