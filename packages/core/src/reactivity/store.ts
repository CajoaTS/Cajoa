import { batch, createSignal, untrack } from "./signal";

const RAW = Symbol("cajoa-store-raw");

const MUTATE_MESSAGE =
  "Cannot change a store directly. Use its setter instead, for example setState('count', 1) or setState((draft) => { draft.count = 1; }).";

interface Cell {
  track(): void;
  notify(): void;
}

interface StoreNode {
  cells: Map<PropertyKey, Cell>;
  own?: Cell;
}

const nodes = new WeakMap<object, StoreNode>();
const readers = new WeakMap<object, object>();
const drafts = new WeakMap<object, object>();

function makeCell(): Cell {
  const [read, write] = createSignal(0);
  return {
    track: () => {
      read();
    },
    notify: () => write((n) => n + 1),
  };
}

function nodeOf(raw: object): StoreNode {
  let node = nodes.get(raw);
  if (!node) {
    node = { cells: new Map() };
    nodes.set(raw, node);
  }
  return node;
}

function trackKey(raw: object, key: PropertyKey) {
  const node = nodeOf(raw);
  let cell = node.cells.get(key);
  if (!cell) {
    cell = makeCell();
    node.cells.set(key, cell);
  }
  cell.track();
}

function trackOwn(raw: object) {
  const node = nodeOf(raw);
  (node.own ??= makeCell()).track();
}

const notifyKey = (raw: object, key: PropertyKey) =>
  nodes.get(raw)?.cells.get(key)?.notify();
const notifyOwn = (raw: object) => nodes.get(raw)?.own?.notify();

function isWrappable(value: unknown): value is object {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function toRaw<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    const raw = (value as Record<symbol, unknown>)[RAW];
    if (raw) return raw as T;
  }
  return value;
}

function unwrapIncoming<T>(value: T, seen: Set<object> = new Set()): T {
  const raw = toRaw(value);
  if (!isWrappable(raw) || seen.has(raw)) return raw;
  seen.add(raw);
  const record = raw as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const child = record[key];
    const inner = unwrapIncoming(child, seen);
    if (inner !== child) record[key] = inner;
  }
  return raw;
}

function removeProperty(raw: object, key: string) {
  if (!Object.prototype.hasOwnProperty.call(raw, key)) return;
  delete (raw as Record<string, unknown>)[key];
  batch(() => {
    notifyKey(raw, key);
    notifyOwn(raw);
  });
}

function writeProperty(raw: object, key: string, input: unknown) {
  const value = toRaw(input);
  const record = raw as Record<string, unknown>;
  const isArray = Array.isArray(raw);
  const had = Object.prototype.hasOwnProperty.call(raw, key);

  if (value === undefined && !isArray) {
    removeProperty(raw, key);
    return;
  }
  if (had && Object.is(record[key], value)) return;

  const next = unwrapIncoming(value);

  if (isArray && key === "length") {
    const array = raw as unknown[];
    const old = array.length;
    const newLength = Number(next);
    array.length = newLength;
    batch(() => {
      for (let i = newLength; i < old; i++) notifyKey(raw, String(i));
      notifyKey(raw, "length");
      notifyOwn(raw);
    });
    return;
  }

  const oldLength = isArray ? (raw as unknown[]).length : 0;
  record[key] = next;

  batch(() => {
    notifyKey(raw, key);
    if (!had) notifyOwn(raw);
    if (isArray && (raw as unknown[]).length !== oldLength) {
      notifyKey(raw, "length");
      notifyOwn(raw);
    }
  });
}

function merge(target: object, source: object) {
  for (const key of Object.keys(source)) {
    writeProperty(target, key, (source as Record<string, unknown>)[key]);
  }
}

const wrapRead = (value: unknown): unknown =>
  isWrappable(value) ? readerOf(toRaw(value)) : value;

const wrapDraft = (value: unknown): unknown =>
  isWrappable(value) ? draftOf(toRaw(value)) : value;

const readHandler: ProxyHandler<object> = {
  get(target, key, receiver) {
    if (key === RAW) return target;
    const value = Reflect.get(target, key, receiver);
    if (typeof key === "symbol") return value;
    if (
      typeof value === "function" &&
      !Object.prototype.hasOwnProperty.call(target, key)
    ) {
      return value;
    }
    trackKey(target, key);
    return wrapRead(value);
  },
  has(target, key) {
    if (key === RAW) return true;
    if (typeof key !== "symbol") trackKey(target, key);
    return Reflect.has(target, key);
  },
  ownKeys(target) {
    trackOwn(target);
    return Reflect.ownKeys(target);
  },
  set() {
    throw new Error(MUTATE_MESSAGE);
  },
  deleteProperty() {
    throw new Error(MUTATE_MESSAGE);
  },
  defineProperty() {
    throw new Error(MUTATE_MESSAGE);
  },
};

const draftHandler: ProxyHandler<object> = {
  get(target, key, receiver) {
    if (key === RAW) return target;
    const value = Reflect.get(target, key, receiver);
    if (typeof key === "symbol") return value;
    return wrapDraft(value);
  },
  set(target, key, value) {
    if (typeof key === "symbol") return Reflect.set(target, key, value);
    writeProperty(target, key, value);
    return true;
  },
  deleteProperty(target, key) {
    if (typeof key === "symbol") return Reflect.deleteProperty(target, key);
    removeProperty(target, key);
    return true;
  },
};

function readerOf(raw: object): object {
  let proxy = readers.get(raw);
  if (!proxy) {
    proxy = new Proxy(raw, readHandler);
    readers.set(raw, proxy);
  }
  return proxy;
}

function draftOf(raw: object): object {
  let proxy = drafts.get(raw);
  if (!proxy) {
    proxy = new Proxy(raw, draftHandler);
    drafts.set(raw, proxy);
  }
  return proxy;
}

// ---------- setState ----------

function applyUpdate(root: object, args: unknown[]) {
  if (args.length === 0) return;

  if (args.length === 1) {
    const arg = args[0];
    if (typeof arg === "function") {
      const result = untrack(() =>
        (arg as (draft: unknown) => unknown)(draftOf(root)),
      );
      if (isWrappable(result) && !Array.isArray(result))
        merge(root, toRaw(result));
      return;
    }
    if (isWrappable(arg) && !Array.isArray(arg)) {
      merge(root, toRaw(arg));
      return;
    }
    throw new Error(
      "setState(): pass an object to merge, a function that edits a draft, or a path followed by a value.",
    );
  }

  const path = args.slice(0, -1) as Array<string | number>;
  const last = args[args.length - 1];

  let target = root;
  for (let i = 0; i < path.length - 1; i++) {
    const next = (target as Record<string, unknown>)[String(path[i])];
    if (!isWrappable(next)) {
      throw new Error(
        `setState(): "${path.slice(0, i + 1).join(".")}" is not an object or an array, so it has no "${path[i + 1]}" to change.`,
      );
    }
    target = toRaw(next);
  }

  const key = String(path[path.length - 1]);
  const prev = (target as Record<string, unknown>)[key];

  if (typeof last === "function") {
    const result = untrack(() => (last as (prev: unknown) => unknown)(prev));
    writeProperty(target, key, result);
    return;
  }

  const incoming = toRaw(last);
  if (
    isWrappable(prev) &&
    !Array.isArray(prev) &&
    isWrappable(incoming) &&
    !Array.isArray(incoming)
  ) {
    merge(toRaw(prev), incoming);
    return;
  }
  writeProperty(target, key, incoming);
}

type Update<V> = V extends readonly unknown[]
  ? V
  : V extends object
    ? Partial<V>
    : V;
type ValueOrUpdate<V> = Update<V> | ((prev: V) => V);

export interface SetStoreFunction<T> {
  (partial: Partial<T>): void;
  (edit: (draft: T) => Partial<T> | void): void;
  <K1 extends keyof T>(k1: K1, value: ValueOrUpdate<T[K1]>): void;
  <K1 extends keyof T, K2 extends keyof T[K1]>(
    k1: K1,
    k2: K2,
    value: ValueOrUpdate<T[K1][K2]>,
  ): void;
  <K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
    k1: K1,
    k2: K2,
    k3: K3,
    value: ValueOrUpdate<T[K1][K2][K3]>,
  ): void;
  <
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    value: ValueOrUpdate<T[K1][K2][K3][K4]>,
  ): void;
}

export function createStore<T extends object>(
  initial: T,
): [T, SetStoreFunction<T>] {
  const root = unwrapIncoming(initial);
  const setState = (...args: unknown[]) => {
    batch(() => applyUpdate(root, args));
  };
  return [readerOf(root) as T, setState as unknown as SetStoreFunction<T>];
}

export function unwrap<T>(value: T): T {
  return toRaw(value);
}
