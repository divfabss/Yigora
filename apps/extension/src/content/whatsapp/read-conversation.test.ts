// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { buildWhatsAppHtml, formatFixtureDate } from "./__fixtures__/whatsapp-dom";
import { readOpenChat } from "./read-conversation";

const now = new Date(2026, 10, 19, 15, 0, 0);
const today = formatFixtureDate(now);
const yesterday = formatFixtureDate(new Date(2026, 10, 18));

function load(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("readOpenChat", () => {
  it("lee solo los mensajes de hoy, con su dirección y sin nombres ni teléfonos", () => {
    const doc = load(
      buildWhatsAppHtml({
        messages: [
          { direction: "incoming", text: "Mensaje de ayer", date: yesterday },
          { direction: "incoming", text: "Hi! Do you have anything for allergies?", date: today },
          { direction: "outgoing", text: "Hello!", date: today },
          { direction: "incoming", text: "foto", date: today, media: true },
        ],
      }),
    );
    const result = readOpenChat(doc, now);
    expect(result.status).toBe("reading");
    if (result.status !== "reading") return;
    expect(result.snapshot.messages).toEqual([
      { direction: "incoming", text: "Hi! Do you have anything for allergies?" },
      { direction: "outgoing", text: "Hello!" },
    ]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("Cliente Ficticio");
    expect(serialized).not.toContain("506");
    expect(result.snapshot.chatKey).toMatch(/^[a-f0-9]{8}$/);
  });

  it("devuelve la misma huella para el mismo chat y otra para un chat distinto", () => {
    const messages = [{ direction: "incoming" as const, text: "Hola", date: today }];
    const first = readOpenChat(load(buildWhatsAppHtml({ chatId: "1@c.us", messages })), now);
    const again = readOpenChat(load(buildWhatsAppHtml({ chatId: "1@c.us", messages })), now);
    const other = readOpenChat(load(buildWhatsAppHtml({ chatId: "2@c.us", messages })), now);
    if (first.status !== "reading" || again.status !== "reading" || other.status !== "reading") {
      throw new Error("lectura inesperada");
    }
    expect(first.snapshot.chatKey).toBe(again.snapshot.chatKey);
    expect(first.snapshot.chatKey).not.toBe(other.snapshot.chatKey);
  });

  it("no lee chats de grupo", () => {
    const doc = load(
      buildWhatsAppHtml({
        chatId: "12345@g.us",
        messages: [{ direction: "incoming", text: "Hola", date: today }],
      }),
    );
    expect(readOpenChat(doc, now)).toEqual({ status: "group" });
  });

  it("indica que no hay chat abierto", () => {
    expect(readOpenChat(load("<div id='side'></div>"), now)).toEqual({ status: "no_chat" });
  });

  it("detecta cuando la estructura de WhatsApp cambió y no se puede leer", () => {
    expect(
      readOpenChat(load("<div id='main'><div class='nuevo-formato'>Hola</div></div>"), now),
    ).toEqual({
      status: "unreadable",
    });
  });

  it("no modifica el documento al leer", () => {
    const doc = load(
      buildWhatsAppHtml({ messages: [{ direction: "incoming", text: "Hola", date: today }] }),
    );
    const before = doc.documentElement.outerHTML;
    readOpenChat(doc, now);
    expect(doc.documentElement.outerHTML).toBe(before);
  });
});

describe("readOpenChat con variantes reales de WhatsApp", () => {
  const wrap = (rows: string) =>
    load(
      `<div id="main"><header><span dir="auto" title="Cliente">Cliente</span></header>${rows}</div>`,
    );
  const row = (id: string, stamp: string, body: string, extraClass = "") =>
    `<div role="row"><div data-id="${id}" class="${extraClass}"><div class="copyable-text" data-pre-plain-text="${stamp}">${body}</div></div></div>`;
  const stamp = (author: string) => `[10:00, ${today}] ${author}: `;

  it("toma el texto de la respuesta y no el del mensaje citado", () => {
    const body = `<div aria-label="Quoted message"><span class="selectable-text">tienen ibuprofeno?</span></div>
      <span class="selectable-text"><span>y cuánto cuesta?</span></span>`;
    const result = readOpenChat(wrap(row("false_1@c.us_A", stamp("Cliente"), body)), now);
    expect(result.status === "reading" && result.snapshot.messages[0]?.text).toBe(
      "y cuánto cuesta?",
    );
  });

  it("conserva emojis (texto alternativo) y saltos de línea", () => {
    const body = `<span class="selectable-text"><span>Hola <img alt="👋" /><br />necesito curitas</span></span>`;
    const result = readOpenChat(wrap(row("false_1@c.us_A", stamp("Cliente"), body)), now);
    expect(result.status === "reading" && result.snapshot.messages[0]?.text).toBe(
      "Hola 👋\nnecesito curitas",
    );
  });

  it("detecta grupos por la cantidad de autores aunque el identificador no lo indique", () => {
    const rows =
      row("false_1@lid_A", stamp("Ana"), `<span class="selectable-text">Hola</span>`) +
      row("false_1@lid_B", stamp("Beto"), `<span class="selectable-text">Buenas</span>`);
    expect(readOpenChat(wrap(rows), now)).toEqual({ status: "group" });
  });

  it("usa las clases de dirección si el data-id cambia de formato", () => {
    const rows = `<div role="row"><div data-id="nuevo-formato-1" class="message-in"><div class="copyable-text" data-pre-plain-text="${stamp("Cliente")}"><span class="selectable-text">tienen suero?</span></div></div></div>`;
    const result = readOpenChat(wrap(rows), now);
    expect(result.status === "reading" && result.snapshot.messages).toEqual([
      { direction: "incoming", text: "tienen suero?" },
    ]);
  });

  it("encuentra el panel con el selector alternativo", () => {
    const doc = load(
      `<div data-testid="conversation-panel-wrapper">${row("false_9@c.us_A", stamp("Cliente"), `<span class="selectable-text">Hola</span>`)}</div>`,
    );
    expect(readOpenChat(doc, now).status).toBe("reading");
  });
});

describe("detección de grupos sin falsos positivos", () => {
  it("no considera grupo un chat donde el contacto aparece con nombre y con número", () => {
    const doc = load(
      `<div id="main">
        <div role="row"><div data-id="false_1@lid_A"><div class="copyable-text" data-pre-plain-text="[10:00, ${today}] Ana: "><span class="selectable-text">Hola</span></div></div></div>
        <div role="row"><div data-id="false_1@lid_B"><div class="copyable-text" data-pre-plain-text="[10:01, ${today}] +506 0000 0000: "><span class="selectable-text">tienen curitas?</span></div></div></div>
      </div>`,
    );
    expect(readOpenChat(doc, now).status).toBe("reading");
  });
});
