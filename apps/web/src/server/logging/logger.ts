/**
 * Logger estructurado con lista blanca de campos.
 *
 * Regla de seguridad: nunca registrar contenido de mensajes, tokens, archivos ni datos
 * personales. Solo se emiten los campos permitidos y valores primitivos acotados; todo lo
 * demás se descarta y se cuenta en `droppedFields`.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

type LogValue = string | number | boolean | null;

const ALLOWED_FIELDS = new Set([
  "requestId",
  "route",
  "method",
  "status",
  "durationMs",
  "organizationId",
  "userId",
  "operation",
  "outcome",
  "errorName",
  "errorCode",
  "provider",
  "model",
  "inputTokens",
  "outputTokens",
]);

const MAX_STRING_LENGTH = 120;

export interface LogRecord {
  readonly level: LogLevel;
  readonly event: string;
  readonly timestamp: string;
  readonly fields: Readonly<Record<string, LogValue>>;
  readonly droppedFields: number;
}

export type LogSink = (record: LogRecord) => void;

export function sanitizeLogFields(fields: Record<string, unknown>): {
  fields: Record<string, LogValue>;
  droppedFields: number;
} {
  const sanitized: Record<string, LogValue> = {};
  let droppedFields = 0;

  for (const [key, value] of Object.entries(fields)) {
    const safeValue = toSafeValue(value);
    if (!ALLOWED_FIELDS.has(key) || safeValue === undefined) {
      droppedFields += 1;
      continue;
    }
    sanitized[key] = safeValue;
  }
  return { fields: sanitized, droppedFields };
}

function toSafeValue(value: unknown): LogValue | undefined {
  if (value === null || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…` : value;
  }
  return undefined;
}

const defaultSink: LogSink = (record) => {
  const line = JSON.stringify(record);
  if (record.level === "error" || record.level === "warn") {
    console.error(line);
  } else {
    console.log(line);
  }
};

export function createLogger(sink: LogSink = defaultSink, now: () => Date = () => new Date()) {
  const write = (level: LogLevel, event: string, rawFields: Record<string, unknown> = {}) => {
    const { fields, droppedFields } = sanitizeLogFields(rawFields);
    sink({ level, event, timestamp: now().toISOString(), fields, droppedFields });
  };

  return {
    debug: (event: string, fields?: Record<string, unknown>) => {
      write("debug", event, fields);
    },
    info: (event: string, fields?: Record<string, unknown>) => {
      write("info", event, fields);
    },
    warn: (event: string, fields?: Record<string, unknown>) => {
      write("warn", event, fields);
    },
    error: (event: string, fields?: Record<string, unknown>) => {
      write("error", event, fields);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;

export const logger = createLogger();
