/** Estilos de la ventana flotante. Viven dentro de un Shadow DOM cerrado: no afectan a WhatsApp. */
export const OVERLAY_HOST_CSS = `
:host { all: initial; }
.panel {
  position: fixed; width: 372px; height: min(620px, calc(100vh - 24px));
  display: flex; flex-direction: column; overflow: hidden;
  background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.12); border-radius: 14px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
}
.header {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px 8px 12px;
  background: #3b4fd1; color: #ffffff; cursor: grab; user-select: none; touch-action: none;
}
.header:active { cursor: grabbing; }
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
}
.icon-button:hover { background: rgba(255, 255, 255, 0.16); }
.icon-button:focus-visible, .bubble:focus-visible { outline: 2px solid #ffffff; outline-offset: 2px; }
iframe { flex: 1; width: 100%; border: 0; background: #f8f9fc; }
.bubble {
  position: fixed; width: 52px; height: 52px; border-radius: 999px; border: 0; cursor: pointer;
  background: #3b4fd1; color: #ffffff; font: 700 20px system-ui, sans-serif;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
}
.hidden { display: none !important; }
`;
