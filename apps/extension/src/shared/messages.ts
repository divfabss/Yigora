import { z } from "zod";

/**
 * Contratos de mensajería interna de la extensión. Todo mensaje se valida con Zod en el
 * receptor: nunca se confía en la forma de un mensaje recibido.
 */
export const MAX_MESSAGES_PER_SNAPSHOT = 20;
export const MAX_MESSAGE_LENGTH = 2000;

export const conversationMessageSchema = z.object({
  direction: z.enum(["incoming", "outgoing"]),
  text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

/**
 * Diagnóstico de lectura, SIN contenido: solo conteos y una muestra del formato de fecha
 * (por ejemplo "19 nov 2026"), útil para ajustar el lector si WhatsApp cambia.
 */
export const readerDiagnosticsSchema = z.object({
  panelFound: z.boolean(),
  messageNodes: z.number().int().nonnegative(),
  withDate: z.number().int().nonnegative(),
  today: z.number().int().nonnegative(),
  dateSample: z
    .string()
    .max(40)
    .regex(/^[\p{L}\p{N}\s.,:/'’-]*$/u)
    .nullable(),
});
export type ReaderDiagnostics = z.infer<typeof readerDiagnosticsSchema>;

export const readerStatusSchema = z.enum(["reading", "paused", "no_chat", "group", "unreadable"]);
export type ReaderStatus = z.infer<typeof readerStatusSchema>;

/** Contenido del chat abierto: solo texto y dirección de los mensajes de HOY. */
export const chatSnapshotSchema = z.object({
  /** Huella del chat (hash): permite detectar cambio de chat sin enviar su nombre. */
  chatKey: z.string().regex(/^[a-f0-9]{8}$/),
  messages: z.array(conversationMessageSchema).max(MAX_MESSAGES_PER_SNAPSHOT),
});
export type ChatSnapshot = z.infer<typeof chatSnapshotSchema>;

/** Identificador aleatorio que empareja el content script con su ventana flotante. */
export const sessionIdSchema = z.string().regex(/^[a-z0-9]{16}$/);

export const contentMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("reader.snapshot"),
    sessionId: sessionIdSchema,
    snapshot: chatSnapshotSchema,
    diagnostics: readerDiagnosticsSchema,
  }),
  z.object({
    type: z.literal("reader.status"),
    sessionId: sessionIdSchema,
    status: readerStatusSchema,
    diagnostics: readerDiagnosticsSchema,
  }),
]);
export type ContentMessage = z.infer<typeof contentMessageSchema>;

export const replyLanguageSchema = z.enum(["es", "en", "pt", "fr", "de", "it"]);
export type ReplyLanguage = z.infer<typeof replyLanguageSchema>;

export const overlayMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("overlay.ready"), sessionId: sessionIdSchema }),
  /** El vendedor agrega un mensaje del cliente (pegado o escrito); se suma a la conversación manual. */
  z.object({
    type: z.literal("conversation.add"),
    text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  }),
  /** Limpia la conversación y la sugerencia mostradas. */
  z.object({ type: z.literal("conversation.clear") }),
  z.object({ type: z.literal("reply.language"), language: replyLanguageSchema }),
  /** Latido: Chrome detiene el service worker tras 30 s sin eventos; esto lo mantiene activo mientras la ventana esté abierta. */
  z.object({ type: z.literal("overlay.ping") }),
]);
export type OverlayMessage = z.infer<typeof overlayMessageSchema>;

/** Mensajes del service worker hacia el content script. */
export const backgroundToContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("reader.resend") }),
  z.object({ type: z.literal("overlay.toggle") }),
]);
export type BackgroundToContent = z.infer<typeof backgroundToContentSchema>;

export const PAUSE_STORAGE_KEY = "yigora.readerPaused";
/** Posición, tamaño y estado fijado de la ventana flotante (no contiene datos de conversaciones). */
export const LAYOUT_STORAGE_KEY = "yigora.overlayLayout";
export const OVERLAY_PORT_NAME = "yigora-overlay";
