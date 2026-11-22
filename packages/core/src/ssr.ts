import { createContext } from "./reactivity/context";

export interface HeadMeta {
  name?: string;
  property?: string;
  content: string;
}

/** The page title and meta tags that <Title> and <Meta> collect while rendering on the server. */
export interface HeadData {
  title?: string;
  meta?: HeadMeta[];
}

/** What components can learn about the request that is being rendered on the server. */
export interface ServerRequest {
  /** The URL of the request (path and query), for example "/users/42?tab=posts". */
  url: string;
  /** Filled by <Title> and <Meta> while rendering. */
  head: HeadData;
  /** <Navigate> asks the server to redirect. */
  redirect(to: string, status: number): void;
  /**
   * Tell renderToStringAsync that there is async work (for example a resource) to wait for.
   * Returns the function to call when the work is done.
   */
  track(): () => void;
  /**
   * Experimental. Set when the page will be hydrated: createResource uses it to hand the data
   * that it loaded to the browser, and to reuse data from an earlier pass.
   */
  transfer?: ResourceTransfer;
}

/**
 * Experimental. How data that a resource loaded moves from the server to the browser. Only
 * @cajoa/server and hydrate() use this, apps do not.
 */
export interface ResourceTransfer {
  /** Called once for each createResource, in the order that they are created. */
  open(): ResourceSlot;
}

/** One createResource call, as seen by the server or by hydrate(). */
export interface ResourceSlot {
  /**
   * The data that was loaded for this resource before, if there is any. `key` says what the
   * resource loads (its source), and `hint` identifies its fetcher.
   */
  take(
    key: string,
    hint: string,
  ): { value: unknown } | { error: unknown } | undefined;
  /** The resource has this value now. `loaded` is true when it was fetched just now. */
  set?(key: string, hint: string, value: unknown, loaded: boolean): void;
  /** The resource failed with this error. */
  fail?(key: string, hint: string, error: unknown): void;
  /** The resource has nothing (its source is empty). */
  clear?(): void;
}

export const ServerContext = createContext<ServerRequest | null>(null);

let browserTransfer: ResourceTransfer | null = null;

/** Used by hydrate() while it runs, so resources start with the data that the server loaded. */
export function setResourceTransfer(transfer: ResourceTransfer | null): void {
  browserTransfer = transfer;
}

export function getResourceTransfer(): ResourceTransfer | null {
  return browserTransfer;
}
