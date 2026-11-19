import { formatFixtureDate } from "../src/content/whatsapp/__fixtures__/whatsapp-dom";
import { expect, overlayFrame, receiveMessage, test } from "./extension-fixture";

const today = formatFixtureDate(new Date());
const yesterday = formatFixtureDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
const WHATSAPP = "https://web.whatsapp.com/";

test("lee el chat abierto, sugiere en el idioma del cliente y nunca escribe en WhatsApp", async ({
  context,
  setWhatsApp,
}) => {
  setWhatsApp({
    messages: [
      { direction: "incoming", text: "Mensaje viejo de ayer sobre ibuprofeno", date: yesterday },
      { direction: "incoming", text: "Hi! Do you have anything for allergies?", date: today },
    ],
  });
  const page = await context.newPage();
  await page.goto(WHATSAPP);
  const overlay = await overlayFrame(page);

  await expect(overlay.getByText("Leyendo mensajes de hoy")).toBeVisible();
  // La ventana debe quedar por ENCIMA de la interfaz de WhatsApp (que usa z-index propios).
  expect(await page.evaluate(() => document.elementFromPoint(150, 500)?.tagName)).toBe(
    "YIGORA-ASSISTANT",
  );
  // Solo los mensajes de hoy.
  await expect(overlay.getByTestId("conversation")).toHaveText(
    "Hi! Do you have anything for allergies?",
  );
  await expect(overlay.getByText("WhatsApp · hoy")).toBeVisible();
  const reply = overlay.getByTestId("reply");
  await expect(reply).toHaveValue(/For that, we have these options:/);
  await expect(reply).toHaveValue(/Loratadina 10 mg/);
  await expect(overlay.getByTestId("product").first()).toContainText("Loratadina 10 mg");

  // El vendedor cambia el idioma de la respuesta.
  await overlay.getByLabel("Idioma de respuesta").selectOption("es");
  await expect(reply).toHaveValue(/Para eso tenemos estas opciones:/);

  // Llega un mensaje nuevo: la sugerencia se actualiza sola.
  await receiveMessage(page, "y tienen cetirizina?", today);
  await expect(reply).toHaveValue(/Cetirizina 10 mg/, { timeout: 10_000 });

  // Copiar solo usa el portapapeles.
  await overlay.getByRole("button", { name: "Copiar" }).click();

  // Nada se escribió ni se envió en WhatsApp.
  await expect(page.locator("#compose")).toHaveText("");
  expect(
    await page.evaluate(() => (window as unknown as { __interactions: string[] }).__interactions),
  ).toEqual([]);
});

test("entiende varios mensajes seguidos del cliente como una sola conversación", async ({
  context,
  setWhatsApp,
}) => {
  setWhatsApp({
    messages: [
      { direction: "incoming", text: "Hola, buenos días.", date: today },
      {
        direction: "incoming",
        text: "Me gustaría consultar por medicamentos para el dolor de cabeza.",
        date: today,
      },
    ],
  });
  const page = await context.newPage();
  await page.goto(WHATSAPP);
  const overlay = await overlayFrame(page);

  await expect(overlay.getByTestId("conversation")).toHaveText(
    "Hola, buenos días.\nMe gustaría consultar por medicamentos para el dolor de cabeza.",
  );
  await expect(overlay.getByTestId("summary")).toContainText("dolor de cabeza");
  await expect(overlay.getByTestId("reply")).toHaveValue(
    /^¡Hola!\nPara eso tenemos estas opciones:\n• Acetaminofén 500 mg/,
  );
});

test("no lee chats de grupo", async ({ context, setWhatsApp }) => {
  setWhatsApp({
    chatId: "12345@g.us",
    messages: [{ direction: "incoming", text: "Hola grupo", date: today }],
  });
  const page = await context.newPage();
  await page.goto(WHATSAPP);
  const overlay = await overlayFrame(page);
  await expect(overlay.getByTestId("conversation-empty")).toHaveText(
    "Chat de grupo: lectura desactivada",
  );
  await expect(overlay.getByTestId("conversation")).toHaveCount(0);
});

test("agrega mensajes a mano como una conversación, se limpia y permite pausar", async ({
  context,
  setWhatsApp,
}) => {
  setWhatsApp({ messages: [] });
  const page = await context.newPage();
  await page.goto(WHATSAPP);
  const overlay = await overlayFrame(page);
  const input = overlay.getByLabel("Escriba o pegue un mensaje del cliente…");

  await overlay.getByRole("button", { name: "Pausar" }).click();
  await expect(overlay.getByText("Lectura en pausa").first()).toBeVisible();

  // Enter agrega el mensaje y el campo se vacía solo.
  await input.fill("Bonjour !");
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await input.fill("Avez-vous quelque chose contre la toux ?");
  await overlay.getByRole("button", { name: "Agregar" }).click();
  await expect(input).toHaveValue("");

  await expect(overlay.getByTestId("conversation")).toHaveText(
    "Bonjour !\nAvez-vous quelque chose contre la toux ?",
  );
  await expect(overlay.getByText("Agregada a mano")).toBeVisible();
  await expect(overlay.getByTestId("reply")).toHaveValue(
    /^Bonjour !\nPour cela, nous avons ces options :/,
  );

  // Limpiar deja la ventana lista para el siguiente cliente.
  await overlay.getByRole("button", { name: "Limpiar" }).click();
  await expect(overlay.getByTestId("conversation")).toHaveCount(0);
  await expect(overlay.getByTestId("reply")).toHaveCount(0);

  await overlay.getByRole("button", { name: "Reanudar" }).click();
  await expect(overlay.getByText("Leyendo mensajes de hoy")).toBeVisible();
});

test("la ventana se puede redimensionar y fijar, y recuerda su diseño", async ({
  context,
  setWhatsApp,
}) => {
  setWhatsApp({ messages: [] });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(WHATSAPP);
  await overlayFrame(page);
  const tagAt = (x: number, y: number) =>
    page.evaluate(([px, py]) => document.elementFromPoint(px ?? 0, py ?? 0)?.tagName, [x, y]);
  // Diseño por defecto: izquierda 12, ancho 380, alto 600, abajo a 12 px → top 108.
  expect(await tagAt(450, 400)).not.toBe("YIGORA-ASSISTANT");

  // Redimensionar desde la esquina inferior derecha (+100 px de ancho).
  await page.mouse.move(386, 702);
  await page.mouse.down();
  await page.mouse.move(486, 702, { steps: 5 });
  await page.mouse.up();
  expect(await tagAt(450, 400)).toBe("YIGORA-ASSISTANT");

  // Fijar: el botón de la chincheta está a la izquierda del de minimizar.
  await page.mouse.click(436, 129);
  const worker = context.serviceWorkers()[0];
  const stored = await worker?.evaluate(() => chrome.storage.local.get("yigora.overlayLayout"));
  expect(stored?.["yigora.overlayLayout"]).toMatchObject({ width: 480, pinned: true });

  // Fijada, arrastrar la barra no la mueve.
  await page.mouse.move(100, 129);
  await page.mouse.down();
  await page.mouse.move(600, 400, { steps: 5 });
  await page.mouse.up();
  expect(await tagAt(60, 300)).toBe("YIGORA-ASSISTANT");
});

test("muestra un diagnóstico sin contenido cuando no reconoce las fechas de WhatsApp", async ({
  context,
  setWhatsApp,
}) => {
  setWhatsApp({
    messages: [{ direction: "incoming", text: "mensaje privado", date: "fecha rara" }],
  });
  const page = await context.newPage();
  await page.goto(WHATSAPP);
  const overlay = await overlayFrame(page);
  const diagnostics = overlay.getByTestId("diagnostics");
  await expect(diagnostics).toContainText("Mensajes encontrados");
  await expect(diagnostics).toContainText("“fecha rara”");
  await expect(diagnostics).not.toContainText("mensaje privado");
});
