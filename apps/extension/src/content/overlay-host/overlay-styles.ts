/** Estilos de la ventana flotante. Viven dentro de un Shadow DOM cerrado: no afectan a WhatsApp. */
export const OVERLAY_HOST_CSS = `
:host { all: initial; }
/* WhatsApp apila su interfaz con z-index propios: la ventana debe quedar siempre encima. */
.panel {
  position: fixed; z-index: 2147483647;
  display: flex; flex-direction: column; overflow: hidden;
  background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 14px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.header {
  display: flex; align-items: center; gap: 6px; padding: 7px 8px 7px 12px;
  background: #3b4fd1; color: #ffffff; cursor: grab; user-select: none; touch-action: none;
}
.header:active { cursor: grabbing; }
.pinned .header, .pinned .header:active { cursor: default; }
.logo {
  width: 22px; height: 22px; border-radius: 6px; background: #ffffff; color: #3b4fd1;
  display: grid; place-items: center; font-weight: 700; font-size: 13px;
}
.title { font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
.badge {
  font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
}
.spacer { flex: 1; }
.icon-button {
  width: 28px; height: 28px; border: 0; border-radius: 7px; background: transparent;
  color: #ffffff; cursor: pointer; font-size: 18px; line-height: 1; display: grid; place-items: center;
  opacity: 0.85;
}
.icon-button:hover { background: rgba(255, 255, 255, 0.16); opacity: 1; }
.icon-button[aria-pressed="true"] { background: rgba(255, 255, 255, 0.28); opacity: 1; }
.icon-button:focus-visible, .bubble:focus-visible { outline: 2px solid #ffffff; outline-offset: 2px; }
iframe { flex: 1; width: 100%; border: 0; background: #f8f9fc; }
/* Esquina para cambiar el tamaño (oculta cuando la ventana está fijada). */
.resizer {
  position: absolute; right: 0; bottom: 0; width: 18px; height: 18px; cursor: nwse-resize;
  touch-action: none;
  background: linear-gradient(135deg, transparent 50%, rgba(59, 79, 209, 0.55) 50%, rgba(59, 79, 209, 0.55) 60%,
    transparent 60%, transparent 72%, rgba(59, 79, 209, 0.55) 72%, rgba(59, 79, 209, 0.55) 82%, transparent 82%);
  border-bottom-right-radius: 14px;
}
.pinned .resizer { display: none; }
.bubble {
  position: fixed; z-index: 2147483647; width: 52px; height: 52px; border-radius: 999px; border: 0;
  cursor: pointer; background: #3b4fd1; color: #ffffff; font: 700 20px system-ui, sans-serif;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
}
.hidden { display: none !important; }
`;
