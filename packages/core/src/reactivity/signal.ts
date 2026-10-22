import { warn } from "../dev";

type Cleanup = () => void;

interface Owner {
  cleanups: Cleanup[];
  parent: Owner | null;
  context?: Map<symbol, unknown>;
  errorHandler?: (error: unknown) => void;
}

interface Computation extends Owner {
  run: () => void;
  deps: Set<Set<Computation>>; 
  disposed: boolean;
}

let currentOwner: Owner | null = null;
let currentEffect: Computation | null = null;

function clean(owner: Owner) {
  const fns = owner.cleanups;
  owner.cleanups = [];
  for (const fn of fns) fn();
}

function cleanComputation(c: Computation) {
  for (const subs of c.deps) subs.delete(c); 
  c.deps.clear();
  clean(c);
}

function addCleanup(fn: Cleanup) {
  currentOwner?.cleanups.push(fn);
}

function handleError(error: unknown, owner: Owner | null): void {
  for (let o = owner; o; o = o.parent) {
    if (o.errorHandler) {
      o.errorHandler(error);
      return;
    }
  }
  throw error;
}

// ---------- batch ----------

let batchDepth = 0;
const pending = new Set<Computation>();

function flush() {
  const effects = [...pending];
  pending.clear();
  effects.forEach((effect) => effect.run());
}

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) flush();
  }
}

// ---------- signal at effect ----------

export function createSignal<T>(value: T) {
  const subs = new Set<Computation>();

  const get = () => {
    if (currentEffect) {
      subs.add(currentEffect);
      currentEffect.deps.add(subs);
    }
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    const v = typeof next === "function" ? (next as any)(value) : next;
    if (Object.is(v, value)) return; 
    value = v;
    for (const effect of [...subs]) {
      if (batchDepth > 0)
        pending.add(effect);
      else effect.run();
    }
  };

  return [get, set] as const;
}

export function createEffect(fn: () => void) {
  const effect: Computation = {
    cleanups: [],
    parent: currentOwner,
    deps: new Set(),
    disposed: false,
    run() {
      if (effect.disposed) return;
      cleanComputation(effect);
      const prevOwner = currentOwner;
      const prevEffect = currentEffect;
      currentOwner = effect;
      currentEffect = effect;
      try {
        fn();
      } catch (error) {
        handleError(error, effect);
      } finally {
        currentOwner = prevOwner;
        currentEffect = prevEffect;
      }
    },
  };

  addCleanup(() => {
    effect.disposed = true;
    cleanComputation(effect);
  });

  effect.run();
}

// ---------- owner, cleanup, lifecycle ----------

export function onCleanup(fn: Cleanup) {
  if (!currentOwner) {
    warn(
      "onCleanup() was called outside of a component or effect, so this cleanup will never run.",
    );
  }
  addCleanup(fn);
}

export function createRoot<T>(fn: (dispose: () => void) => T): T {
  const root: Owner = { cleanups: [], parent: currentOwner };
  const prevOwner = currentOwner;
  const prevEffect = currentEffect;
  currentOwner = root;
  currentEffect = null;
  try {
    return fn(() => clean(root));
  } finally {
    currentOwner = prevOwner;
    currentEffect = prevEffect;
  }
}

export function onMount(fn: () => void) {
  const owner = currentOwner;
  Promise.resolve().then(() => {
    const prevOwner = currentOwner;
    const prevEffect = currentEffect;
    currentOwner = owner; 
    currentEffect = null; 
    try {
      fn();
    } catch (error) {
      handleError(error, owner);
    } finally {
      currentOwner = prevOwner;
      currentEffect = prevEffect;
    }
  });
}

export function untrack<T>(fn: () => T): T {
  const prev = currentEffect;
  currentEffect = null;
  try {
    return fn();
  } finally {
    currentEffect = prev;
  }
}

// ---------- error handling ----------

export function catchError<T>(
  fn: () => T,
  handler: (error: unknown) => void,
): T | undefined {
  const owner: Owner = {
    cleanups: [],
    parent: currentOwner,
    errorHandler: handler,
  };
  addCleanup(() => clean(owner));

  const prevOwner = currentOwner;
  currentOwner = owner;

  let result: T | undefined;
  let thrown = null as { error: unknown } | null;
  try {
    result = fn();
  } catch (error) {
    clean(owner); 
    thrown = { error };
  } finally {
    currentOwner = prevOwner;
  }

  if (thrown) {
    handler(thrown.error);
    return undefined;
  }
  return result;
}

export interface Context<T> {
  readonly id: symbol;
  readonly defaultValue: T;
}

export function createContext<T>(defaultValue: T): Context<T> {
  return { id: Symbol("cajoa-context"), defaultValue };
}

export function provide<T, R>(ctx: Context<T>, value: T, fn: () => R): R {
  const owner: Owner = {
    cleanups: [],
    parent: currentOwner,
    context: new Map([[ctx.id, value]]),
  };
  addCleanup(() => clean(owner)); 
  const prev = currentOwner;
  currentOwner = owner;
  try {
    return fn();
  } finally {
    currentOwner = prev;
  }
}

export function useContext<T>(ctx: Context<T>): T {
  if (!currentOwner) {
    warn(
      "useContext() was called outside of a component or effect, so it can only return the default value. Call it at the top of your component and use the value later.",
    );
  }
  for (let o = currentOwner; o; o = o.parent) {
    if (o.context?.has(ctx.id)) return o.context.get(ctx.id) as T;
  }
  return ctx.defaultValue;
}
