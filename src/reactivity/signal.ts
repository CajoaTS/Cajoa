type Effect = () => void;
let current: Effect | null = null;

export function createSignal<T>(value: T) {
  const subs = new Set<Effect>();

  const get = () => {
    if (current) subs.add(current);
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as any)(value) : next;
    [...subs].forEach((fn) => fn());
  };

  return [get, set] as const;
}

export function createEffect(fn: Effect) {
  const run = () => {
    const prev = current;
    current = run;
    try {
      fn();
    } finally {
      current = prev;
    }
  };
  run();
}
