import { createContext } from "./reactivity/signal";

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
}

export const ServerContext = createContext<ServerRequest | null>(null);
