type Cleanup = () => void;

interface Owner {
  cleanups: Cleanup[];
}

interface Computation extends Owner {
  run: () => void;
  deps: Set<Set<Computation>>; // all signals that's been read
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
  for (const subs of c.deps) subs.delete(c); // this unsubscribes to all signal
  c.deps.clear();
  clean(c); // run cleanups (tgt with the disposal of the children)
}

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
    if (Object.is(v, value)) return; // no changes, no update
    value = v;
    for (const effect of [...subs]) {
      if (batchDepth > 0)
        pending.add(effect); // itabi muna
      else effect.run();
    }
  };

  return [get, set] as const;
}

export function createEffect(fn: () => void) {
  const effect: Computation = {
    cleanups: [],
    deps: new Set(),
    disposed: false,
    run() {
      if (effect.disposed) return;
      cleanComputation(effect); // cleanup the prev run
      const prevOwner = currentOwner;
      const prevEffect = currentEffect;
      currentOwner = effect;
      currentEffect = effect;
      try {
        fn();
      } finally {
        currentOwner = prevOwner;
        currentEffect = prevEffect;
      }
    },
  };

  // the parent (if there is)  will dispose this effect
  onCleanup(() => {
    effect.disposed = true;
    cleanComputation(effect);
  });

  effect.run();
}

export function onCleanup(fn: Cleanup) {
  currentOwner?.cleanups.push(fn);
}

export function createRoot<T>(fn: (dispose: () => void) => T): T {
  const root: Owner = { cleanups: [] };
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
  queueMicrotask(() => {
    const prevOwner = currentOwner;
    const prevEffect = currentEffect;
    currentOwner = owner; // to make the onCleanup work inside the onMount
    currentEffect = null; // doesn't track signals
    try {
      fn();
    } finally {
      currentOwner = prevOwner;
      currentEffect = prevEffect;
    }
  });
}
