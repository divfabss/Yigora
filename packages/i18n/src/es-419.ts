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
    reader: {
      reading: "Leyendo mensajes de hoy",
      paused: "Lectura en pausa",
      no_chat: "Abra un chat para comenzar",
      group: "Chat de grupo: lectura desactivada",
      unreadable: "No se pudo leer este chat",
    },
    pause: "Pausar",
    resume: "Reanudar",
    disconnected: "Reconectando…",
    conversation: "Conversación",
    sourceWhatsApp: "WhatsApp · hoy",
    sourceManual: "Agregada a mano",
    emptyConversation: "Aquí aparecerán los mensajes del cliente de hoy.",
    noMessagesToday: "Aún no hay mensajes del cliente hoy en este chat.",
    awaitingCustomer: "Ya respondió; esperando al cliente.",
    clear: "Limpiar",
    addPlaceholder: "Escriba o pegue un mensaje del cliente…",
    add: "Agregar",
    addHint: "Enter para agregar · Shift+Enter para nueva línea",
    summary: "Pide",
    translation: "Traducción",
    reply: "Respuesta sugerida",
    replyLanguage: "Idioma de respuesta",
    copyFallback: "No se pudo copiar: seleccione el texto y presione Ctrl+C.",
    products: "Inventario",
    noProducts: "Sin coincidencias en el inventario.",
    noPrice: "Sin precio",
    units: "u.",
    prescription: "Receta",
    stale: "Desactualizado",
    diagnosticsTitle: "Diagnóstico de lectura",
    diagnosticsHelp:
      "Si ve esto en un chat con mensajes de hoy, envíenos una captura de este recuadro.",
    diagnosticsPanel: "Chat detectado",
    diagnosticsMessages: "Mensajes encontrados",
    diagnosticsWithDate: "Con fecha reconocida",
    diagnosticsToday: "De hoy",
    diagnosticsDateSample: "Formato de fecha no reconocido",
    yes: "Sí",
    no: "No",
  },
  home: {
    underConstructionTitle: "Yigora está en construcción",
    underConstructionBody: "Estamos preparando la plataforma. El acceso es solo por invitación.",
  },
} as const;

export type Messages = typeof es419;
