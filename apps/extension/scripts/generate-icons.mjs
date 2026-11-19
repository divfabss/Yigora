// Genera los íconos PNG de la extensión a partir de un SVG (requiere Playwright/Chromium).
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="30" fill="#3b4fd1"/>
  <path d="M38 34 L64 66 L90 34" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M64 66 V96" stroke="#fff" stroke-width="14" stroke-linecap="round"/>
</svg>`;

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
    : {},
);
for (const size of [16, 32, 48, 128]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}</style>${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}`,
  );
  const out = fileURLToPath(new URL(`../public/icons/icon-${size}.png`, import.meta.url));
  await page.screenshot({ path: out, omitBackground: true });
  await page.close();
}
await browser.close();
