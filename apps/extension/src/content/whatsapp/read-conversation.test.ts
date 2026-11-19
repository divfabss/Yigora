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
