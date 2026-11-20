import { setRenderer } from "@cajoa/core";
import { domRenderer } from "./dom-renderer";

setRenderer(domRenderer);

export { domRenderer } from "./dom-renderer";
export { hydrate } from "./hydrate";
export * from "./router";
export type { JSX, CSSProperties, TargetedEvent } from "./jsx";
export * from "./head";
