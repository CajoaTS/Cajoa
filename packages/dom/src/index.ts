import { setRenderer } from "@cajoa/core";
import { domRenderer } from "./dom-renderer";

setRenderer(domRenderer); 

export { domRenderer } from "./dom-renderer";
export * from "./router";
export type { JSX, CSSProperties, TargetedEvent } from "./jsx";