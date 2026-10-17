import type { Renderer } from "./types";

let current: Renderer | null = null;

export function setRenderer(renderer: Renderer) {
  current = renderer;
}

export function getRenderer(): Renderer {
  if (!current) {
    throw new Error(
      "Cajoa: no renderer set. Import from 'cajoa' or '@cajoa/dom', or call setRenderer()."
    );
  }
  return current;
}