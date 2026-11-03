import { materialize } from "../runtime/h";
import { provide } from "./signal";

export interface Context<T> {
  readonly id: symbol;
  readonly defaultValue: T;
  /**
   * Everything created inside can read `value` with useContext().
   * `value` is read once: pass a signal (or a function) if you need it to stay live.
   */
  Provider(props: { value: T; children?: unknown }): unknown;
}

export function createContext<T>(defaultValue: T): Context<T> {
  const context: Context<T> = {
    id: Symbol("cajoa-context"),
    defaultValue,
    Provider(props) {
      // materialize makes a function child reactive, inside the provided scope
      return provide(context, props.value, () => materialize(props.children));
    },
  };
  return context;
}
