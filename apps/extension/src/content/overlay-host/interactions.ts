import { clampLayout, type OverlayLayout, type Viewport } from "./layout";

/**
 * Arrastrar y redimensionar con eventos de puntero sobre ELEMENTOS PROPIOS de la ventana.
 * La captura del puntero mantiene el gesto aunque el cursor pase sobre el iframe.
 */
export interface GestureOptions {
  readonly handle: HTMLElement;
  readonly view: Viewport;
  readonly getLayout: () => OverlayLayout;
  readonly isEnabled: () => boolean;
  readonly onChange: (layout: OverlayLayout) => void;
  readonly onEnd: (layout: OverlayLayout) => void;
}

type Transform = (start: OverlayLayout, deltaX: number, deltaY: number) => OverlayLayout;

function enableGesture(options: GestureOptions, transform: Transform): void {
  const { handle } = options;
  handle.addEventListener("pointerdown", (down) => {
    if (!options.isEnabled() || (down.target as HTMLElement).closest("button")) {
      return;
    }
    down.preventDefault();
    const start = options.getLayout();
    handle.setPointerCapture(down.pointerId);
    let current = start;
    const move = (event: PointerEvent) => {
      current = clampLayout(
        transform(start, event.clientX - down.clientX, event.clientY - down.clientY),
        options.view,
      );
      options.onChange(current);
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      options.onEnd(current);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  });
}

export function enableDragging(options: GestureOptions): void {
  enableGesture(options, (start, deltaX, deltaY) => ({
    ...start,
    left: start.left + deltaX,
    top: start.top + deltaY,
  }));
}

export function enableResizing(options: GestureOptions): void {
  enableGesture(options, (start, deltaX, deltaY) => ({
    ...start,
    width: start.width + deltaX,
    height: start.height + deltaY,
  }));
}
