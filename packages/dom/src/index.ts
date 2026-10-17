import { setRenderer } from "@cajoa/core";
import { domRenderer } from "./dom-renderer";

setRenderer(domRenderer); // DOM ang default kapag na-import ang package na ito

export { domRenderer } from "./dom-renderer";
export * from "./router";
