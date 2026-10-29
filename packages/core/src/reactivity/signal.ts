import { warn } from "../dev";
import { isServer } from "../renderer";

type Cleanup = () => void;

interface Owner {
  cleanups: Cleanup[];
  parent: Owner | null;
  context?: Map<symbol, unknown>;
  errorHandler?: (error: unknown) => void;
}

interface Source {
  observers: Set<Computation>;
}

const CLEAN: number = 0;
const CHECK: number = 1;
const DIRTY: number = 2;

interface Computation extends Owner, Source {
  fn: () => unknown;
  isEffect: boolean;
  state: number;
  sources: Set<Source>;
  disposed: boolean;
  hasValue: boolean;
  value: unknown;
}

let currentOwner: Owner | null = null;
let listener: Computation | null = null;

function clean(owner: Owner) {
  const fns = owner.cleanups;
  owner.cleanups = [];
  for (const fn of fns) fn();
}

function cleanComputation(c: Computation) {
  for (const source of c.sources) source.observers.delete(c);
  c.sources.clear();
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

// ---------- scheduler ----------

let batchDepth = 0;
let flushing = false;
const queued = new Set<Computation>();

const isComputation = (source: Source): source is Computation => "fn" in source;

function track(source: Source) {
  if (listener) {
    source.observers.add(listener);
    listener.sources.add(source);
  }
}

function mark(node: Computation, state: number) {
  if (node.disposed || node.state >= state) return;
  const wasClean = node.state === CLEAN;
  node.state = state;
  if (!wasClean) return;

  if (node.isEffect) {
    queued.add(node);
  } else {
    for (const observer of node.observers) mark(observer, CHECK);
  }
}

function notify(source: Source) {
  for (const observer of source.observers) mark(observer, DIRTY);
  if (batchDepth === 0 && !flushing) flush();
}

function run(node: Computation) {
  cleanComputation(node);
  const prevOwner = currentOwner;
  const prevListener = listener;
  currentOwner = node;
  listener = node;
  node.state = CLEAN;
  try {
    const result = node.fn();
    if (!node.isEffect) {
      const changed = node.hasValue && !Object.is(node.value, result);
      node.value = result;
      node.hasValue = true;
      if (changed) {
        for (const observer of node.observers) {
          if (observer.state === CHECK) observer.state = DIRTY;
        }
      }
    }
  } catch (error) {
    handleError(error, node);
  } finally {
    currentOwner = prevOwner;
    listener = prevListener;
  }
}

function update(node: Computation) {
  if (node.disposed) {
    node.state = CLEAN;
    return;
  }
  if (node.state === CHECK) {
    for (const source of [...node.sources]) {
      if (isComputation(source)) {
        update(source);
        if (node.state === DIRTY) break;
      }
    }
  }
  if (node.state === DIRTY) run(node);
  else node.state = CLEAN;
}

function flush() {
  flushing = true;
  let failure = null as { error: unknown } | null;
  let steps = 0;

  try {
    while (queued.size > 0) {
      if (++steps > 100_000) {
        queued.clear();
        failure ??= {
          error: new Error(
            "Cajoa: updates never settled. An effect probably keeps changing a signal that it also reads.",
          ),
        };
        break;
      }
      const effect = queued.values().next().value as Computation;
      queued.delete(effect);
      try {
        update(effect);
      } catch (error) {
        failure ??= { error };
      }
    }
  } finally {
    flushing = false;
  }

  if (failure) throw failure.error;
}

function dispose(node: Computation) {
  node.disposed = true;
  queued.delete(node);
  cleanComputation(node);
}

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0 && !flushing) flush();
  }
}

// ---------- signal, effect at memo ----------

export function createSignal<T>(value: T) {
  const source: Source = { observers: new Set() };

  const get = () => {
    track(source);
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    const v = typeof next === "function" ? (next as any)(value) : next;
    if (Object.is(v, value)) return;
    value = v;
    notify(source);
  };

  return [get, set] as const;
}

function createComputation(fn: () => unknown, isEffect: boolean): Computation {
  return {
    fn,
    isEffect,
    cleanups: [],
    parent: currentOwner,
    sources: new Set(),
    observers: new Set(),
    state: DIRTY,
    disposed: false,
    hasValue: false,
    value: undefined,
  };
}

export function createEffect(fn: () => void) {
  const node = createComputation(fn, true);
  addCleanup(() => dispose(node));
  run(node);
}

export function createMemo<T>(fn: () => T): () => T {
  const node = createComputation(fn, false);
  addCleanup(() => dispose(node));
  run(node);

  return () => {
    if (node.state !== CLEAN) update(node);
    track(node);
    return node.value as T;
  };
}

export function createSelector<T>(source: () => T): (key: T) => boolean {
  const cells = new Map<T, Source>();
  let previous = untrack(source);

  createEffect(() => {
    const next = source();
    if (Object.is(next, previous)) return;
    const old = previous;
    previous = next;
    batch(() => {
      for (const key of [old, next]) {
        const cell = cells.get(key);
        if (cell) notify(cell);
      }
    });
  });

  return (key) => {
    const current = untrack(source);
    if (listener) {
      let cell = cells.get(key);
      if (!cell) {
        cell = { observers: new Set() };
        cells.set(key, cell);
      }
      track(cell);
      const mine = cell;
      listener.cleanups.push(() => {
        if (mine.observers.size === 0 && cells.get(key) === mine)
          cells.delete(key);
      });
    }
    return Object.is(current, key);
  };
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
  const prevListener = listener;
  currentOwner = root;
  listener = null;
  try {
    return fn(() => clean(root));
  } finally {
    currentOwner = prevOwner;
    listener = prevListener;
  }
}

export function onMount(fn: () => void) {
  if (isServer()) return;
  const owner = currentOwner;
  Promise.resolve().then(() => {
    const prevOwner = currentOwner;
    const prevListener = listener;
    currentOwner = owner;
    listener = null;
    try {
      fn();
    } catch (error) {
      handleError(error, owner);
    } finally {
      currentOwner = prevOwner;
      listener = prevListener;
    }
  });
}

export function untrack<T>(fn: () => T): T {
  const prev = listener;
  listener = null;
  try {
    return fn();
  } finally {
    listener = prev;
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

// ---------- context ----------

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
