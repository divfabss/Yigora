import { describe, expect, it } from "vitest";
import { clampLayout, defaultLayout, MIN_HEIGHT, MIN_WIDTH, restoreLayout } from "./layout";

const view = { innerWidth: 1366, innerHeight: 768 };

describe("diseño de la ventana flotante", () => {
  it("por defecto queda abajo a la izquierda, sin fijar y dentro de la pantalla", () => {
    const layout = defaultLayout(view);
    expect(layout.left).toBe(12);
    expect(layout.top + layout.height).toBe(768 - 12);
    expect(layout.pinned).toBe(false);
  });

  it("respeta el tamaño mínimo y no se sale de la pantalla", () => {
    const tiny = clampLayout({ left: -50, top: 5000, width: 10, height: 10, pinned: false }, view);
    expect(tiny.width).toBe(MIN_WIDTH);
    expect(tiny.height).toBe(MIN_HEIGHT);
    expect(tiny.left).toBe(12);
    expect(tiny.top + tiny.height).toBeLessThanOrEqual(768 - 12);
    const huge = clampLayout({ left: 0, top: 0, width: 5000, height: 5000, pinned: true }, view);
    expect(huge.width).toBe(1366 - 24);
    expect(huge.pinned).toBe(true);
  });

  it("restaura lo guardado y descarta datos inválidos", () => {
    const saved = { left: 100, top: 80, width: 420, height: 500, pinned: true };
    expect(restoreLayout(saved, view)).toEqual(saved);
    expect(restoreLayout({ left: "x" }, view)).toEqual(defaultLayout(view));
  });
});
