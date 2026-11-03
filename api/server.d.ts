import { HeadData, render } from '@cajoa/core';

type Component = Parameters<typeof render>[0];
interface RenderOptions {
    url?: string;
    /**
     * Write comment markers that a future hydrate() will use. Experimental: there is no hydrate() yet,
     * and the marker format can change. Default: false.
     */
    hydratable?: boolean;
    head?: HeadData;
    onRedirect?: (to: string, status: number) => void;
}
interface AsyncRenderOptions extends RenderOptions {
    timeout?: number;
}
declare function renderToString(app: Component, options?: RenderOptions): string;
declare function renderToStringAsync(app: Component, options?: AsyncRenderOptions): Promise<string>;
/** Turns the head object into <title> and <meta> tags, ready to put in your HTML. */
declare function headToString(head: HeadData): string;

export { headToString, renderToString, renderToStringAsync };
export type { AsyncRenderOptions, RenderOptions };
