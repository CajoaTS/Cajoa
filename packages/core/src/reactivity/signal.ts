import { warn } from "../dev";
import { isServer } from "../renderer";

type Cleanup = () => void;

interface Owner {
  cleanups: Cleanup[];
  parent: Owner | null;
  context?: Map<symbol, unknown>;
  errorHandler?: (error: unknown) => void;
}

/** Anything that can have listeners: a signal or a memo. */
interface Source {
  observers: Set<Computation>;
  name?: string;
}

// Computation states. They are typed as `number` on purpose, so TypeScript does not complain about comparisons.
const CLEAN: number = 0;
const CHECK: number = 1; // maybe old: a memo above it may have changed
const DIRTY: number = 2; // surely old: a direct source changed

interface Computation extends Owner, Source {
  fn: () => unknown;
  isEffect: boolean;
  state: number;
  sources: Set<Source>;
  disposed: boolean;
  hasValue: boolean; // for memos
  value: unknown; // for memos
  equals?: false | ((previous: any, next: any) => boolean); // for memos
}

export interface SignalOptions<T> {
  /**
   * How to tell that a new value is the same as the old one. The default is Object.is.
   * Use `false` to notify on every write, even with the same value (for example after
   * changing an object in place). Or pass your own function.
   */
  equals?: false | ((previous: T, next: T) => boolean);
  /** A name for error messages (and, later, for the debugger). */
  name?: string;
}

export interface EffectOptions {
  /** A name for error messages (and, later, for the debugger). */
  name?: string;
}

let currentOwner: Owner | null = null;
let listener: Computation | null = null; // the computation that tracks what is read

function clean(owner: Owner) {
  const fns = owner.cleanups;
  owner.cleanups = [];
  for (const fn of fns) fn();
}

function cleanComputation(c: Computation) {
  for (const source of c.sources) source.observers.delete(c); // unsubscribe
  c.sources.clear();
  clean(c); // run the cleanups (this also disposes the children)
}

/** For the inside of the core: no warning when there is no owner (for example an effect at module level). */
function addCleanup(fn: Cleanup) {
  currentOwner?.cleanups.push(fn);
}

/** Find the nearest error handler going up. If there is none, throw the error again. */
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
const queued = new Set<Computation>(); // effects that need a check

const isComputation = (source: Source): source is Computation => "fn" in source;

function track(source: Source) {
  if (listener) {
    source.observers.add(listener);
    listener.sources.add(source);
  }
}

/** Mark the computation and everything below it. Effects go into the queue. */
function mark(node: Computation, state: number) {
  if (node.disposed || node.state >= state) return;
  const wasClean = node.state === CLEAN;
  node.state = state;
  if (!wasClean) return; // the things below were already told

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
      const had = node.hasValue;
      const same =
        had &&
        (node.equals === undefined
          ? Object.is(node.value, result)
          : node.equals !== false && node.equals(node.value, result));
      node.value = result;
      node.hasValue = true;
      if (had && !same) {
        // the waiting listeners (CHECK) are now surely old
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

/** Update the computation if needed: pull the memos above it first. */
function update(node: Computation) {
  if (node.disposed) {
    node.state = CLEAN;
    return;
  }
  if (node.state === CHECK) {
    for (const source of [...node.sources]) {
      if (isComputation(source)) {
        update(source);
        if (node.state === DIRTY) break; // something changed: no need to look at the rest
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
        const names = [...queued].map((e) => e.name).filter(Boolean);
        queued.clear();
        failure ??= {
          error: new Error(
            "Cajoa: updates never settled. An effect probably keeps changing a signal that it also reads." +
              (names.length > 0
                ? " Effects waiting: " + names.join(", ") + "."
                : ""),
          ),
        };
        break;
      }
      const effect = queued.values().next().value as Computation;
      queued.delete(effect);
      try {
        update(effect);
      } catch (error) {
        failure ??= { error }; // keep going; the first error is thrown afterwards
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

// ---------- signal, effect and memo ----------

export function createSignal<T>(value: T, options?: SignalOptions<T>) {
  const source: Source = { observers: new Set(), name: options?.name };
  const equals = options?.equals;

  const get = () => {
    track(source);
    return value;
  };

  const set = (next: T | ((prev: T) => T)) => {
    const v =
      typeof next === "function" ? (next as (prev: T) => T)(value) : next;
    const same =
      equals === false
        ? false
        : equals
          ? equals(value, v)
          : Object.is(value, v);
    if (same) return; // no change, no update
    value = v;
    notify(source);
  };

  return [get, set] as const;
}

function createComputation(
  fn: () => unknown,
  isEffect: boolean,
  name?: string,
): Computation {
  return {
    fn,
    isEffect,
    name,
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

export function createEffect(fn: () => void, options?: EffectOptions) {
  const node = createComputation(fn, true, options?.name);
  addCleanup(() => dispose(node)); // the parent (if there is one) disposes it
  run(node);
}

/**
 * A cached computed value. It is computed when it is read (or when an effect needs it),
 * and it only tells the listeners when the result changes.
 */
export function createMemo<T>(
  fn: () => T,
  options?: SignalOptions<T>,
): () => T {
  const node = createComputation(fn, false, options?.name);
  node.equals = options?.equals;
  addCleanup(() => dispose(node));
  run(node);

  return () => {
    if (node.state !== CLEAN) update(node); // pull the fresh value before reading
    track(node);
    return node.value as T;
  };
}

/**
 * For "which one is selected?". `isSelected(key)` only wakes the two keys that changed
 * (the old and the new selection), even if thousands are listening.
 */
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
    const current = untrack(source); // always the latest, so there is no glitch
    if (listener) {
      let cell = cells.get(key);
      if (!cell) {
        cell = { observers: new Set() };
        cells.set(key, cell);
      }
      track(cell);
      const mine = cell;
      // When nobody listens to the key any more, drop the cell so it does not pile up
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
  if (isServer()) return; // there is no "mount" on the server: window and document are safe inside it
  const owner = currentOwner;
  Promise.resolve().then(() => {
    const prevOwner = currentOwner;
    const prevListener = listener;
    currentOwner = owner; // so onCleanup works inside onMount
    listener = null; // does not track signals
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

/**
 * Runs `fn`. An error that it throws (or that the effects and onMount created inside it throw, even later)
 * goes to `handler` instead of being thrown.
 */
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
    clean(owner); // throw away what was half made
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

// ---------- context (createContext is in ./context) ----------

export function provide<T, R>(
  ctx: { readonly id: symbol; readonly defaultValue: T },
  value: T,
  fn: () => R,
): R {
  const owner: Owner = {
    cleanups: [],
    parent: currentOwner,
    context: new Map([[ctx.id, value]]),
  };
  addCleanup(() => clean(owner)); // cleaned when the parent goes away
  const prev = currentOwner;
  currentOwner = owner;
  try {
    return fn();
  } finally {
    currentOwner = prev;
  }
}

export function useContext<T>(ctx: {
  readonly id: symbol;
  readonly defaultValue: T;
}): T {
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
