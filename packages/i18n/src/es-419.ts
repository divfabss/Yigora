/**
 * Catálogo de textos de interfaz en español latinoamericano neutro.
 * Toda cadena visible para el usuario debe venir de aquí (no escribir textos sueltos en componentes).
 */
export const es419 = {
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
  languages: {
    es: "Español",
    en: "Inglés",
    pt: "Portugués",
    fr: "Francés",
    de: "Alemán",
    it: "Italiano",
  },
  overlay: {
    demoNotice: "Modo demostración · inventario ficticio",
    reader: {
      reading: "Leyendo mensajes de hoy",
      paused: "Lectura en pausa",
      no_chat: "Abra un chat para comenzar",
      group: "Chat de grupo: lectura desactivada",
      unreadable: "No se pudo leer la conversación. Pegue el mensaje abajo.",
    },
    pause: "Pausar",
    resume: "Reanudar",
    disconnected: "Reconectando con la extensión…",
    customerMessage: "Mensaje del cliente",
    manualSource: "Mensaje pegado",
    awaitingCustomer: "Ya respondió; esperando al cliente.",
    languageUnknown: "Idioma no determinado",
    translation: "Traducción al español",
    translationPending: "La traducción automática se activará con la IA en la versión conectada.",
    summary: "Lo que pide el cliente",
    products: "Productos encontrados",
    noProducts: "Sin coincidencias en el inventario.",
    noPrice: "Sin precio",
    units: "u.",
    prescription: "Requiere receta",
    stale: "Desactualizado",
    tips: "Sugerencia comercial",
    reply: "Respuesta sugerida",
    replyLanguage: "Idioma de respuesta",
    editableHint: "Puede editar la respuesta antes de copiarla.",
    copyFallback: "No se pudo copiar automáticamente: seleccione el texto y presione Ctrl+C.",
    manualTitle: "Pegar mensaje del cliente",
    manualPlaceholder: "Pegue aquí el mensaje del cliente…",
    analyze: "Analizar",
    noMessagesToday: "Aún no hay mensajes del cliente hoy en este chat.",
    neverSends: "Yigora nunca envía mensajes. Usted decide qué responder.",
  },
  home: {
    underConstructionTitle: "Yigora está en construcción",
    underConstructionBody: "Estamos preparando la plataforma. El acceso es solo por invitación.",
  },
} as const;

export type Messages = typeof es419;
