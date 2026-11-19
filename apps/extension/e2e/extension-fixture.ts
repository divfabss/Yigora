import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  chromium,
  test as base,
  type BrowserContext,
  type Frame,
  type Page,
} from "@playwright/test";
import {
  buildWhatsAppHtml,
  type FixtureOptions,
} from "../src/content/whatsapp/__fixtures__/whatsapp-dom";

const EXTENSION_PATH = join(import.meta.dirname, "..", "dist");

interface ExtensionFixtures {
  context: BrowserContext;
  /** Cambia el contenido simulado que se servirá como https://web.whatsapp.com/. */
  setWhatsApp: (options: FixtureOptions) => void;
}

export const test = base.extend<ExtensionFixtures>({
  // eslint-disable-next-line no-empty-pattern -- firma requerida por Playwright
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(
      mkdtempSync(join(tmpdir(), "yigora-e2e-")),
      {
        headless: true,
        ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {}),
        args: [
          `--disable-extensions-except=${EXTENSION_PATH}`,
          `--load-extension=${EXTENSION_PATH}`,
        ],
      },
    );
    await use(context);
    await context.close();
  },
  setWhatsApp: async ({ context }, use) => {
    let html = buildWhatsAppHtml({ messages: [] });
    await context.route("https://web.whatsapp.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: html }),
    );
    await use((options) => {
      html = buildWhatsAppHtml(options);
    });
  },
});

export const expect = test.expect;

/** La ventana flotante vive en un iframe de la extensión dentro de un Shadow DOM cerrado. */
export async function overlayFrame(page: Page): Promise<Frame> {
  await expect
    .poll(() => page.frames().some((frame) => frame.url().includes("/overlay.html")), {
      timeout: 15_000,
    })
    .toBe(true);
  const frame = page.frames().find((candidate) => candidate.url().includes("/overlay.html"));
  if (!frame) {
    throw new Error("No se encontró la ventana flotante");
  }
  return frame;
}

/** Simula la llegada de un mensaje nuevo en WhatsApp (lo hace la "página", no la extensión). */
export async function receiveMessage(page: Page, text: string, date: string): Promise<void> {
  await page.evaluate(
    ({ text: messageText, date: messageDate }) => {
      const row = document.createElement("div");
      row.setAttribute("role", "row");
      const container = document.createElement("div");
      container.setAttribute("data-id", `false_50600000000@c.us_NEW${String(Date.now())}`);
      container.className = "message-in";
      const copyable = document.createElement("div");
      copyable.className = "copyable-text";
      copyable.setAttribute("data-pre-plain-text", `[11:00, ${messageDate}] Cliente: `);
      const span = document.createElement("span");
      span.className = "selectable-text copyable-text";
      span.textContent = messageText;
      copyable.append(span);
      container.append(copyable);
      row.append(container);
      document.querySelector("#main .conversation")?.append(row);
    },
    { text, date },
  );
}
