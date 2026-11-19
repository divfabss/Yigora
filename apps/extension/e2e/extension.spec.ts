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
  await expect(overlay.getByTestId("customer-text")).toHaveText(
    "Hi! Do you have anything for allergies?",
  );
  await expect(overlay.getByText(/^Inglés · \d+%$/)).toBeVisible();
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

test("no lee chats de grupo", async ({ context, setWhatsApp }) => {
  setWhatsApp({
    chatId: "12345@g.us",
    messages: [{ direction: "incoming", text: "Hola grupo", date: today }],
  });
  const page = await context.newPage();
  await page.goto(WHATSAPP);
  const overlay = await overlayFrame(page);
  await expect(overlay.getByText("Chat de grupo: lectura desactivada")).toBeVisible();
  await expect(overlay.getByTestId("customer-text")).toHaveCount(0);
});

test("permite pausar la lectura y analizar un mensaje pegado", async ({ context, setWhatsApp }) => {
  setWhatsApp({
    messages: [{ direction: "incoming", text: "Hola, tienen suero oral?", date: today }],
  });
  const page = await context.newPage();
  await page.goto(WHATSAPP);
  const overlay = await overlayFrame(page);
  await expect(overlay.getByTestId("reply")).toHaveValue(
    /Permítame verificar si tenemos Suero oral/,
  );

  await overlay.getByRole("button", { name: "Pausar" }).click();
  await expect(overlay.getByText("Lectura en pausa")).toBeVisible();

  await overlay.getByText("Pegar mensaje del cliente").click();
  await overlay
    .getByLabel("Pegar mensaje del cliente")
    .fill("Bonjour, avez-vous quelque chose contre la toux ?");
  await overlay.getByRole("button", { name: "Analizar" }).click();
  await expect(overlay.getByTestId("reply")).toHaveValue(/Pour cela, nous avons ces options :/);
  await expect(overlay.getByText("Mensaje pegado")).toBeVisible();

  await overlay.getByRole("button", { name: "Reanudar" }).click();
  await expect(overlay.getByText("Leyendo mensajes de hoy")).toBeVisible();
});
