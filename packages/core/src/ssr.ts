import { createContext } from "./reactivity/signal";

export interface ServerRequest {
  url: string;
  redirect(to: string, status: number): void;
  track(): () => void;
}

export const ServerContext = createContext<ServerRequest | null>(null);