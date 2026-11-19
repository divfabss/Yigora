import { expect, overlayFrame, test } from "./extension-fixture";

/**
 * Prueba contra el WhatsApp Web REAL (pantalla de inicio de sesión, sin cuenta).
 * Verifica lo que la réplica no puede: cabeceras de seguridad reales (CSP, COEP), capas con
 * z-index de WhatsApp y que la ventana flotante funcione sobre la página verdadera.
 * Requiere acceso a red a web.whatsapp.com y static.whatsapp.net:
 *   YIGORA_REAL_WHATSAPP=1 pnpm --filter @yigora/extension test:e2e real-whatsapp
 */
test.skip(!process.env.YIGORA_REAL_WHATSAPP, "Solo se ejecuta con YIGORA_REAL_WHATSAPP=1");

test("la ventana flotante es visible y funciona sobre WhatsApp Web real", async ({ context }) => {
  const page = await context.newPage();
  await page.goto("https://web.whatsapp.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  const overlay = await overlayFrame(page);

  await expect(overlay.getByText("Abra un chat para comenzar").first()).toBeVisible({
    timeout: 30_000,
  });
  // Espera a que WhatsApp termine de dibujar su interfaz y verifica que la ventana quede encima.
  await page.waitForTimeout(5_000);
  expect(await page.evaluate(() => document.elementFromPoint(150, 500)?.tagName)).toBe(
    "YIGORA-ASSISTANT",
  );

  const input = overlay.getByLabel("Escriba o pegue un mensaje del cliente…");
  await input.fill("Hi! Do you have anything for allergies?");
  await input.press("Enter");
  await expect(overlay.getByTestId("reply")).toHaveValue(/Loratadina 10 mg/);
});
