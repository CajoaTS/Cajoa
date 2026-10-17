import type { Renderer } from "./types";
import { domRenderer } from "./dom";

let current: Renderer = domRenderer; // DOM default

export function setRenderer(renderer: Renderer) {
  current = renderer;
}

export function getRenderer(): Renderer {
  return current;
}
