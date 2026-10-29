import { quietly } from "../dev";
import { ServerContext } from "../ssr";
import { createContext, useContext } from "./signal";

export interface SuspenseState {
  add(): () => void;
}

export const SuspenseContext = createContext<SuspenseState | null>(null);

export function trackPending(): (() => () => void) | undefined {
  const state = quietly(() => useContext(SuspenseContext));
  if (state) return () => state.add();
  const server = quietly(() => useContext(ServerContext));
  return server ? () => server.track() : undefined;
}