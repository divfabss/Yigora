import { expect, test } from "@playwright/test";

test("la página principal carga en español con la marca Yigora", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-CR");
  await expect(page.getByText("Yigora", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Yigora está en construcción" })).toBeVisible();
});

test("aplica CSP con nonce y cabeceras de seguridad", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toMatch(
    /script-src 'self' 'nonce-[^']+' 'strict-dynamic'/,
  );
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("el nonce cambia en cada petición", async ({ request }) => {
  const nonceOf = async () =>
    /'nonce-([^']+)'/.exec(
      (await request.get("/")).headers()["content-security-policy"] ?? "",
    )?.[1];
  expect(await nonceOf()).not.toBe(await nonceOf());
});

test("la página no presenta errores de CSP en consola", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content Security Policy/i.test(message.text())) {
      violations.push(message.text());
    }
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(violations).toEqual([]);
});

test("el endpoint de salud responde sin exponer detalles", async ({ request }) => {
  const response = await request.get("/api/v1/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});
