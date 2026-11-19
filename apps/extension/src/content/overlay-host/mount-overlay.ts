import { OVERLAY_HOST_CSS } from "./overlay-styles";

export interface OverlayPosition {
  readonly left: number;
  readonly top: number;
}

export interface OverlayHostOptions {
  readonly doc: Document;
  readonly iframeUrl: string;
  readonly initialPosition: OverlayPosition | null;
  readonly onPositionChange: (position: OverlayPosition) => void;
}

export interface OverlayHost {
  toggle(): void;
  destroy(): void;
}

const MARGIN = 12;

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

function clamp(
  position: OverlayPosition,
  width: number,
  height: number,
  view: Window,
): OverlayPosition {
  return {
    left: Math.min(
      Math.max(MARGIN, position.left),
      Math.max(MARGIN, view.innerWidth - width - MARGIN),
    ),
    top: Math.min(
      Math.max(MARGIN, position.top),
      Math.max(MARGIN, view.innerHeight - height - MARGIN),
    ),
  };
}

function buildHeader(doc: Document): { header: HTMLDivElement; minimize: HTMLButtonElement } {
  const header = element(doc, "div", "header");
  const minimize = element(doc, "button", "icon-button", "–");
  minimize.type = "button";
  minimize.setAttribute("aria-label", "Minimizar Yigora");
  header.append(
    element(doc, "span", "logo", "Y"),
    element(doc, "span", "title", "Yigora"),
    element(doc, "span", "badge", "Demo"),
    element(doc, "span", "spacer"),
    minimize,
  );
  return { header, minimize };
}

function enableDragging(
  handle: HTMLElement,
  panel: HTMLElement,
  options: OverlayHostOptions,
): void {
  const view = options.doc.defaultView ?? window;
  handle.addEventListener("pointerdown", (start) => {
    if ((start.target as HTMLElement).closest("button")) {
      return;
    }
    const rect = panel.getBoundingClientRect();
    const offsetX = start.clientX - rect.left;
    const offsetY = start.clientY - rect.top;
    handle.setPointerCapture(start.pointerId);
    const move = (event: PointerEvent) => {
      const next = clamp(
        { left: event.clientX - offsetX, top: event.clientY - offsetY },
        rect.width,
        rect.height,
        view,
      );
      panel.style.left = `${next.left}px`;
      panel.style.top = `${next.top}px`;
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      const box = panel.getBoundingClientRect();
      options.onPositionChange({ left: box.left, top: box.top });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
  });
}

/**
 * Inserta la ventana flotante: un anfitrión con Shadow DOM CERRADO que contiene un iframe a una
 * página de la extensión. WhatsApp no puede leer el contenido del iframe (origen distinto) y los
 * estilos de ambos lados no se mezclan. Solo se agregan elementos propios; no se toca WhatsApp.
 */
export function mountOverlay(options: OverlayHostOptions): OverlayHost {
  const { doc } = options;
  const view = doc.defaultView ?? window;
  const host = doc.createElement("yigora-assistant");
  const shadow = host.attachShadow({ mode: "closed" });
  const style = doc.createElement("style");
  style.textContent = OVERLAY_HOST_CSS;

  const panel = element(doc, "div", "panel");
  panel.setAttribute("role", "complementary");
  panel.setAttribute("aria-label", "Asistente Yigora");
  const { header, minimize } = buildHeader(doc);
  const frame = doc.createElement("iframe");
  frame.src = options.iframeUrl;
  frame.title = "Sugerencias de Yigora";
  frame.allow = "clipboard-write";
  panel.append(header, frame);

  const bubble = element(doc, "button", "bubble hidden", "Y");
  bubble.type = "button";
  bubble.setAttribute("aria-label", "Abrir Yigora");

  const defaultPosition = {
    left: MARGIN,
    top: view.innerHeight - Math.min(620, view.innerHeight - 24) - MARGIN,
  };
  const position = clamp(
    options.initialPosition ?? defaultPosition,
    372,
    Math.min(620, view.innerHeight - 24),
    view,
  );
  panel.style.left = `${position.left}px`;
  panel.style.top = `${position.top}px`;
  bubble.style.left = `${MARGIN}px`;
  bubble.style.bottom = `${MARGIN}px`;

  const setMinimized = (minimized: boolean) => {
    panel.classList.toggle("hidden", minimized);
    bubble.classList.toggle("hidden", !minimized);
  };
  minimize.addEventListener("click", () => {
    setMinimized(true);
  });
  bubble.addEventListener("click", () => {
    setMinimized(false);
  });
  enableDragging(header, panel, options);

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
