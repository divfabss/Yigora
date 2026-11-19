import { WHATSAPP_SELECTORS as S } from "./selectors";

/**
 * Extrae el texto visible de un mensaje en modo de solo lectura: conserva emojis (texto
 * alternativo de las imágenes) y saltos de línea, y omite el texto de mensajes citados.
 */
function collectText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (!(node instanceof Element)) {
    return "";
  }
  if (node.tagName === "IMG") {
    return node.getAttribute("alt") ?? "";
  }
  if (node.tagName === "BR") {
    return "\n";
  }
  return [...node.childNodes].map(collectText).join("");
}

export function readMessageText(copyable: Element): string {
  const candidates = [...copyable.querySelectorAll(S.messageText)].filter(
    (element) => !element.closest(S.quotedMessage),
  );
  // El cuerpo del mensaje es el último bloque de texto (los anteriores suelen ser citas).
  const body = candidates.at(-1) ?? copyable;
  return collectText(body).trim();
}
