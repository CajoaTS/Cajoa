import { quietly } from "../dev";
import { createContext, useContext } from "./signal";

export interface SuspenseState {
  add(): () => void;
}

export const SuspenseContext = createContext<SuspenseState | null>(null);

export function trackPending(): (() => () => void) | undefined {
  const state = quietly(() => useContext(SuspenseContext));
  return state ? () => state.add() : undefined;
}
