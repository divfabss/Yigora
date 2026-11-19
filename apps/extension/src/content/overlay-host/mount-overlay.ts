import { enableDragging, enableResizing } from "./interactions";
import { clampLayout, type OverlayLayout } from "./layout";
import { OVERLAY_HOST_CSS } from "./overlay-styles";

export interface OverlayHostOptions {
  readonly doc: Document;
  readonly iframeUrl: string;
  readonly initialLayout: OverlayLayout;
  readonly onLayoutChange: (layout: OverlayLayout) => void;
}

export interface OverlayHost {
  toggle(): void;
  destroy(): void;
}

const MARGIN = 12;
const SVG_NS = "http://www.w3.org/2000/svg";

function element<K extends keyof HTMLElementTagNameMap>(
  doc: Document,
  tag: K,
  className: string,
  text = "",
): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

/** Ícono de chincheta (fijar) construido con DOM, sin innerHTML. */
function pinIcon(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("aria-hidden", "true");
  const path = doc.createElementNS(SVG_NS, "path");
  path.setAttribute("d", "M15 3l6 6-3 1-4 4 1 5-2 2-4-4-5 5-1-1 5-5-4-4 2-2 5 1 4-4z");
  path.setAttribute("fill", "currentColor");
  svg.append(path);
  return svg;
}

function iconButton(doc: Document, label: string, content: string | Node): HTMLButtonElement {
  const button = element(doc, "button", "icon-button");
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.append(content);
  return button;
}

function applyLayout(panel: HTMLElement, layout: OverlayLayout): void {
  panel.style.left = `${layout.left}px`;
  panel.style.top = `${layout.top}px`;
  panel.style.width = `${layout.width}px`;
  panel.style.height = `${layout.height}px`;
  panel.classList.toggle("pinned", layout.pinned);
}

/**
 * Inserta la ventana flotante: un anfitrión con Shadow DOM CERRADO que contiene un iframe a una
 * página de la extensión. Se puede mover, redimensionar, fijar y minimizar. Solo agrega elementos
 * propios; no toca la interfaz de WhatsApp.
 */
export function mountOverlay(options: OverlayHostOptions): OverlayHost {
  const { doc } = options;
  const view = doc.defaultView ?? window;
  let layout = clampLayout(options.initialLayout, view);

  const host = doc.createElement("yigora-assistant");
  const shadow = host.attachShadow({ mode: "closed" });
  const style = doc.createElement("style");
  style.textContent = OVERLAY_HOST_CSS;

  const panel = element(doc, "div", "panel");
  panel.setAttribute("role", "complementary");
  panel.setAttribute("aria-label", "Asistente Yigora");
  const header = element(doc, "div", "header");
  const pin = iconButton(doc, "Fijar ventana", pinIcon(doc));
  const minimize = iconButton(doc, "Minimizar Yigora", "–");
  header.append(
    element(doc, "span", "logo", "Y"),
    element(doc, "span", "title", "Yigora"),
    element(doc, "span", "badge", "Demo"),
    element(doc, "span", "spacer"),
    pin,
    minimize,
  );
  const frame = doc.createElement("iframe");
  frame.src = options.iframeUrl;
  frame.title = "Sugerencias de Yigora";
  frame.allow = "clipboard-write";
  const resizer = element(doc, "div", "resizer");
  resizer.setAttribute("aria-hidden", "true");
  resizer.title = "Arrastre para cambiar el tamaño";
  panel.append(header, frame, resizer);

  const bubble = element(doc, "button", "bubble hidden", "Y");
  bubble.type = "button";
  bubble.setAttribute("aria-label", "Abrir Yigora");
  bubble.style.left = `${MARGIN}px`;
  bubble.style.bottom = `${MARGIN}px`;

  const update = (next: OverlayLayout, persist: boolean) => {
    layout = next;
    applyLayout(panel, layout);
    pin.setAttribute("aria-pressed", String(layout.pinned));
    pin.title = layout.pinned ? "Desfijar ventana" : "Fijar ventana";
    if (persist) {
      options.onLayoutChange(layout);
    }
  };
  const gesture = (handle: HTMLElement) => ({
    handle,
    view,
    getLayout: () => layout,
    isEnabled: () => !layout.pinned,
    onChange: (next: OverlayLayout) => {
      update(next, false);
    },
    onEnd: (next: OverlayLayout) => {
      update(next, true);
    },
  });
  enableDragging(gesture(header));
  enableResizing(gesture(resizer));

  const setMinimized = (minimized: boolean) => {
    panel.classList.toggle("hidden", minimized);
    bubble.classList.toggle("hidden", !minimized);
  };
  pin.addEventListener("click", () => {
    update({ ...layout, pinned: !layout.pinned }, true);
  });
  minimize.addEventListener("click", () => {
    setMinimized(true);
  });
  bubble.addEventListener("click", () => {
    setMinimized(false);
  });
  view.addEventListener("resize", () => {
    update(clampLayout(layout, view), false);
  });

  update(layout, false);
  shadow.append(style, panel, bubble);
  doc.documentElement.append(host);

  return {
    toggle: () => {
      setMinimized(!panel.classList.contains("hidden"));
    },
    destroy: () => {
      host.remove();
    },
  };
}
