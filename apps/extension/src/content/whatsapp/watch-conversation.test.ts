// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildWhatsAppHtml, formatFixtureDate } from "./__fixtures__/whatsapp-dom";
import { watchConversation } from "./watch-conversation";

afterEach(() => {
  vi.useRealTimers();
});

describe("watchConversation", () => {
  it("lee aunque la página cambie sin parar (presencia, 'escribiendo…')", async () => {
    vi.useFakeTimers();
    const now = new Date();
    document.documentElement.innerHTML = new DOMParser().parseFromString(
      buildWhatsAppHtml({ messages: [] }),
      "text/html",
    ).documentElement.innerHTML;
    const snapshots: number[] = [];
    const watcher = watchConversation({
      doc: document,
      isPaused: () => false,
      onSnapshot: (snapshot) => snapshots.push(snapshot.messages.length),
      onStatus: () => undefined,
      now: () => now,
      intervalMs: 700,
    });
    const conversation = document.querySelector("#main .conversation");
    const presence = document.querySelector("#main header span:last-child");
    // Llega un mensaje y, en paralelo, la cabecera cambia cada 100 ms durante 3 segundos.
    conversation?.insertAdjacentHTML(
      "beforeend",
      `<div role="row"><div data-id="false_1@c.us_X" class="message-in"><div class="copyable-text" data-pre-plain-text="[10:00, ${formatFixtureDate(now)}] C: "><span class="selectable-text">Hola</span></div></div></div>`,
    );
    for (let tick = 0; tick < 30; tick += 1) {
      if (presence) presence.textContent = tick % 2 === 0 ? "escribiendo…" : "en línea";
      await vi.advanceTimersByTimeAsync(100);
    }
    watcher.stop();
    expect(snapshots.at(-1)).toBe(1);
  });
});
