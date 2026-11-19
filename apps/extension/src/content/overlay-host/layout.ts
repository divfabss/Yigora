import { z } from "zod";

/** Posición, tamaño y estado fijado de la ventana flotante. */
export const overlayLayoutSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
  pinned: z.boolean(),
});
export type OverlayLayout = z.infer<typeof overlayLayoutSchema>;

export const MARGIN = 12;
export const MIN_WIDTH = 300;
export const MIN_HEIGHT = 340;
const DEFAULT_WIDTH = 380;
const DEFAULT_HEIGHT = 600;

export interface Viewport {
  readonly innerWidth: number;
  readonly innerHeight: number;
}

/** Ajusta la ventana para que siempre quepa en pantalla. */
export function clampLayout(layout: OverlayLayout, view: Viewport): OverlayLayout {
  const maxWidth = Math.max(MIN_WIDTH, view.innerWidth - MARGIN * 2);
  const maxHeight = Math.max(MIN_HEIGHT, view.innerHeight - MARGIN * 2);
  const width = Math.min(Math.max(MIN_WIDTH, layout.width), maxWidth);
  const height = Math.min(Math.max(MIN_HEIGHT, layout.height), maxHeight);
  return {
    ...layout,
    width,
    height,
    left: Math.min(
      Math.max(MARGIN, layout.left),
      Math.max(MARGIN, view.innerWidth - width - MARGIN),
    ),
    top: Math.min(
      Math.max(MARGIN, layout.top),
      Math.max(MARGIN, view.innerHeight - height - MARGIN),
    ),
  };
}

/** Por defecto: abajo a la izquierda, sobre la lista de chats (no tapa la conversación). */
export function defaultLayout(view: Viewport): OverlayLayout {
  const height = Math.min(DEFAULT_HEIGHT, view.innerHeight - MARGIN * 2);
  return clampLayout(
    {
      left: MARGIN,
      top: view.innerHeight - height - MARGIN,
      width: DEFAULT_WIDTH,
      height,
      pinned: false,
    },
    view,
  );
}

/** Convierte lo guardado en almacenamiento en un diseño válido (o el predeterminado). */
export function restoreLayout(stored: unknown, view: Viewport): OverlayLayout {
  const parsed = overlayLayoutSchema.safeParse(stored);
  return parsed.success ? clampLayout(parsed.data, view) : defaultLayout(view);
}
