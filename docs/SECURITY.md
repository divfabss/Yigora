# Seguridad y protección de datos

> **Estado:** modelo aprobado (Fase 0). Ningún control está implementado aún.

## 1. Autenticación

- **Supabase Auth** (correo + contraseña o enlace mágico) para el dashboard.
- **Solo por invitación:** registro público desactivado. El administrador de plataforma (propietario de Yigora)
  invita usuarios y activa o suspende empresas. La operación de invitar usa la API administrativa de Supabase
  (Service Role Key) en un endpoint de servidor restringido a `platform_admins`, con registro en `audit_log`.
- Una empresa suspendida o vencida pierde el acceso de inmediato (API + RLS), incluida la extensión.
- **Extensión:** no contiene claves. Flujo de vinculación propuesto:
  1. El vendedor inicia sesión en la web.
  2. La página, autorizada mediante `externally_connectable` (solo nuestro dominio), entrega a la extensión
     un token de sesión.
  3. La extensión lo guarda en `chrome.storage.session` (memoria; se borra al cerrar el navegador) y lo envía
     como `Authorization: Bearer` a `apps/web/api`.
  4. El servidor valida el JWT en cada petición.
- Sesiones cortas con renovación; cierre de sesión revoca la sesión en Supabase.

## 2. Autorización

- Roles por organización: `owner`, `admin`, `seller`.
- La organización activa se valida contra `memberships` en servidor; **nunca** se confía en un `organization_id`
  enviado por el cliente.
- Doble barrera: verificación en servicios del servidor **y** RLS en Postgres (ver `DATABASE.md` §3).
- Identificadores UUID; aun así, toda lectura por id pasa por RLS (protección IDOR).

## 3. Credenciales

- Variables de entorno; `.env*` en `.gitignore`; `.env.example` sin valores.
- La API key del proveedor de IA y la Service Role Key solo existen en el servidor.
- Escaneo de secretos (gitleaks) en CI y antes de cada commit.

## 4. Amenazas y controles

| Amenaza | Control |
|---|---|
| SQL Injection | Solo cliente Supabase/RPC parametrizado; funciones plpgsql sin `EXECUTE` dinámico con entrada del usuario |
| XSS | React escapa por defecto; prohibido `dangerouslySetInnerHTML`; CSP estricta con nonces; textos de IA y de archivos se renderizan como texto |
| CSRF | API de la extensión usa Bearer (no cookies). Server Actions de Next.js con verificación de origen; route handlers con cookie verifican `Origin` |
| Prompt injection | Mensajes del cliente como datos delimitados; el LLM no tiene herramientas ni acceso a BD; salida con esquema estricto; `GroundingValidator`; solo se envían productos ya filtrados de la org actual |
| IDOR / acceso cruzado | RLS + verificación de membresía + pruebas pgTAP |
| Escalada de privilegios | Roles en `memberships` modificables solo por owner/admin; políticas por rol |
| Manipulación de archivos | Ver §5 |
| Abuso de endpoints / DoS | Límite por usuario, organización e IP; tamaño máximo de cuerpo; presupuesto diario de IA; tiempos de espera |
| Exposición de credenciales | Ver §3 |
| Fugas por logs | Logger estructurado con lista blanca de campos; nunca contenido de mensajes, tokens, archivos ni datos personales |
| Extensión comprometida/abusiva | Permisos mínimos (`storage` + dos hosts); sin `eval`; CSP de MV3; sin código remoto |
| Página de WhatsApp leyendo o falsificando la ventana flotante | UI en iframe de origen de la extensión dentro de Shadow DOM cerrado; mensajería solo por `chrome.runtime` validada con Zod, nunca `window.postMessage` |
| Lectura excesiva de conversaciones | Solo chat abierto, solo mensajes de hoy, sin grupos, sin nombres ni teléfonos, sin persistencia, botón de pausa |
| Envío automático de mensajes | No existe código de escritura en WhatsApp; prueba estática + E2E (escenario 17) |

## 5. Seguridad de archivos importados

- Extensiones permitidas: `.xlsx`, `.csv`. Rechazo de `.xlsm`, `.xls`, `.xlsb` y cualquier otra.
- Verificación de MIME **y** firma binaria (XLSX = ZIP con `[Content_Types].xml`; rechazo si contiene `vbaProject.bin`).
- Límites: 5 MB de archivo, 50 MB descomprimido total (anti zip-bomb), 5 000 filas, 50 columnas, 2 000 caracteres por celda.
- CSV: detección de codificación (UTF-8 / Windows-1252) y delimitador (`,` `;` tab); rechazo de bytes nulos.
- **Nunca** se ejecutan macros ni se evalúan fórmulas. Celdas con fórmula: se usa el valor calculado guardado
  en el archivo y se marca advertencia (decisión D10).
- Valores que comienzan con `= + - @` se neutralizan en cualquier exportación (CSV injection).
- Validación de cada fila con Zod: números finitos, stock entero ≥ 0, precio ≥ 0 con formato costarricense
  (`₡1.500`, `1 500,00`, `1,500.00`) y detección de ambigüedad.
- El parseo ocurre solo en el servidor; la validación en el navegador es únicamente de experiencia de usuario.

## 6. Protección de datos personales (Costa Rica)

Referencia: **Ley 8968** (Protección de la Persona frente al Tratamiento de sus Datos Personales) y su
reglamento; autoridad: PRODHAB. _Este documento no constituye asesoría legal; se recomienda revisión por un
profesional en derecho costarricense antes de un piloto con datos reales._

- **Datos sensibles:** las conversaciones de farmacia pueden revelar información de salud, considerada dato
  sensible. Por eso:
  - no se almacenan conversaciones; se procesan en memoria y se descartan;
  - no se guardan nombres ni teléfonos de clientes finales;
  - logs y métricas sin contenido.
- **Proveedor de IA como encargado de tratamiento:** el texto enviado al proveedor sale del país. Requiere
  contrato/condiciones de tratamiento de datos, configuración de retención mínima del proveedor y mención en la
  política de privacidad. La IA puede desactivarse por organización.
- **Minimización:** solo se envían al proveedor los mensajes relevantes recientes y los productos recuperados.
- **Retención propuesta:** `import_rows` 30 días; `ai_usage_events` y `audit_log` 12 meses; cuentas
  eliminadas → borrado de datos de la organización en 30 días.
- **Derechos de las personas:** al no almacenar datos de clientes finales, el alcance se limita a usuarios de
  la plataforma (acceso, rectificación y eliminación desde el dashboard o por solicitud).
- Evaluar con asesoría legal si corresponde inscripción de bases de datos ante PRODHAB y las implicaciones
  regulatorias sanitarias para farmacias.

## 7. Condiciones de uso de WhatsApp

Las condiciones de WhatsApp limitan el acceso automatizado o no autorizado y la recolección de información de
usuarios. **El propietario decidió (2026-11-18) la lectura automática al abrir un chat, limitada a mensajes del
día**, aceptando el riesgo de que WhatsApp lo considere no autorizado (posibles restricciones a la cuenta del
vendedor) y de que cambios en WhatsApp Web rompan la lectura.

Mitigaciones: solo lectura, sin automatizar la página, alcance mínimo (chat abierto, hoy, sin grupos), sin
persistencia, pausa visible y respaldo manual. Recomendación vigente: revisión legal antes de distribuir a
clientes, informar a cada empresa cliente de este riesgo en las condiciones de servicio de Yigora, y planificar
la ruta oficial (API de WhatsApp Business Platform). Ver `ARCHITECTURE.md` §6.
