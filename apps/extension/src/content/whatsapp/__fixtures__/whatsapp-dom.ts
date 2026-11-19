/**
 * Réplica simplificada y FICTICIA de la estructura de WhatsApp Web para pruebas.
 * No contiene datos reales.
 */
export interface FixtureMessage {
  readonly direction: "incoming" | "outgoing";
  readonly text: string;
  /** Fecha en formato D/M/AAAA tal como la muestra WhatsApp. */
  readonly date: string;
  readonly media?: boolean;
}

export interface FixtureOptions {
  readonly chatId?: string;
  readonly title?: string;
  readonly messages: readonly FixtureMessage[];
}

export const formatFixtureDate = (date: Date): string =>
  `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderMessage(message: FixtureMessage, index: number, chatId: string): string {
  const outgoing = message.direction === "outgoing";
  const dataId = `${outgoing ? "true" : "false"}_${chatId}_MSG${index}`;
  const author = outgoing ? "Vendedor" : "Cliente Ficticio +506 0000-0000";
  const body = message.media
    ? `<div class="media"><img alt="imagen" /></div>`
    : `<div class="copyable-text" data-pre-plain-text="[10:${String(index).padStart(2, "0")}, ${message.date}] ${author}: ">
         <span class="selectable-text copyable-text"><span>${escapeHtml(message.text)}</span></span>
       </div>`;
  return `<div role="row"><div data-id="${dataId}" class="${outgoing ? "message-out" : "message-in"}">${body}</div></div>`;
}

export function buildWhatsAppHtml({
  chatId = "50600000000@c.us",
  title = "Cliente Ficticio",
  messages,
}: FixtureOptions): string {
  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><title>WhatsApp</title></head>
  <body>
    <div id="app">
      <div id="side" style="position:fixed;left:0;top:0;bottom:0;width:30%;background:#fff">Chats</div>
      <div id="main" style="position:fixed;left:30%;right:0;top:0;bottom:0">
        <header><span dir="auto" title="${escapeHtml(title)}">${escapeHtml(title)}</span><span>en línea</span></header>
        <div class="conversation">${messages.map((message, index) => renderMessage(message, index, chatId)).join("")}</div>
        <footer>
          <div id="compose" contenteditable="true" data-tab="10" role="textbox"></div>
          <button id="send" type="button" aria-label="Enviar">Enviar</button>
        </footer>
      </div>
    </div>
    <script>
      // Registro de interacciones: las pruebas verifican que la extensión nunca escriba ni envíe.
      window.__interactions = [];
      document.getElementById("send").addEventListener("click", () => window.__interactions.push("send"));
      for (const type of ["input", "keydown", "beforeinput", "paste", "focus"]) {
        document.getElementById("compose").addEventListener(type, () => window.__interactions.push(type));
      }
    </script>
  </body>
</html>`;
}
