import {
  batch,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  createStore,
} from "@cajoa/core";

interface Scenario {
  run: () => void;
  check?: () => void;
  dispose: () => void;
}

const results: Array<Record<string, string | number>> = [];
let sink = 0; // para hindi alisin ng minifier ang mga binabasa

const median = (values: number[]) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

/** Ang `make` ay paghahanda (hindi sinusukat). Ang `run` lang ang sinusukat. */
function bench(name: string, ops: number, make: () => Scenario, runs = 9) {
  const samples: number[] = [];
  for (let i = 0; i < runs + 3; i++) {
    const scenario = make();
    const start = performance.now();
    scenario.run();
    const elapsed = performance.now() - start;
    scenario.check?.();
    scenario.dispose();
    if (i >= 3) samples.push(elapsed); // ang unang 3 ay warmup
  }
  const mid = median(samples);
  results.push({
    scenario: name,
    "median ms": +mid.toFixed(2),
    "min ms": +Math.min(...samples).toFixed(2),
    "µs per op": +((mid * 1000) / ops).toFixed(3),
  });
}

function inRoot<T>(fn: () => T): { value: T; dispose: () => void } {
  let dispose = () => {};
  const value = createRoot((d) => {
    dispose = d;
    return fn();
  });
  return { value, dispose };
}

function expect(label: string, actual: number, expected: number) {
  if (actual !== expected)
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

bench("1 signal → 1 effect, 100k writes", 100_000, () => {
  const { value, dispose } = inRoot(() => {
    const [n, setN] = createSignal(0);
    let runs = 0;
    createEffect(() => {
      n();
      runs++;
    });
    return { setN, runs: () => runs };
  });
  return {
    run: () => {
      for (let i = 1; i <= 100_000; i++) value.setN(i);
    },
    check: () => expect("effect runs", value.runs(), 100_001),
    dispose,
  };
});

bench("1 signal → 1,000 effects, 100 writes", 100_000, () => {
  const { value, dispose } = inRoot(() => {
    const [n, setN] = createSignal(0);
    let runs = 0;
    for (let i = 0; i < 1000; i++) {
      createEffect(() => {
        n();
        runs++;
      });
    }
    return { setN, runs: () => runs };
  });
  return {
    run: () => {
      for (let i = 1; i <= 100; i++) value.setN(i);
    },
    check: () => expect("effect runs", value.runs(), 101_000),
    dispose,
  };
});

bench("chain of 1,000 memos, 100 writes", 100_000, () => {
  const { value, dispose } = inRoot(() => {
    const [n, setN] = createSignal(0);
    let last: () => number = n;
    for (let i = 0; i < 1000; i++) {
      const prev = last;
      last = createMemo(() => prev() + 1);
    }
    let out = 0;
    let runs = 0;
    createEffect(() => {
      out = last();
      runs++;
    });
    return { setN, out: () => out, runs: () => runs };
  });
  return {
    run: () => {
      for (let i = 1; i <= 100; i++) value.setN(i);
    },
    check: () => {
      expect("final value", value.out(), 1100);
      expect("effect runs", value.runs(), 101);
    },
    dispose,
  };
});

bench("1 signal → 1,000 memos → 1 effect, 100 writes", 100_000, () => {
  const { value, dispose } = inRoot(() => {
    const [n, setN] = createSignal(0);
    const memos = Array.from({ length: 1000 }, (_, i) =>
      createMemo(() => n() + i),
    );
    let sum = 0;
    let runs = 0;
    createEffect(() => {
      let total = 0;
      for (const m of memos) total += m();
      sum = total;
      runs++;
    });
    return { setN, sum: () => sum, runs: () => runs };
  });
  return {
    run: () => {
      for (let i = 1; i <= 100; i++) value.setN(i);
    },
    check: () => {
      expect("final sum", value.sum(), 599_500);
      expect("effect runs (glitch-free = once per write)", value.runs(), 101);
    },
    dispose,
  };
});

bench("batch of 1,000 signals → 1 effect, 100 rounds", 100_000, () => {
  const { value, dispose } = inRoot(() => {
    const pairs = Array.from({ length: 1000 }, () => createSignal(0));
    let runs = 0;
    createEffect(() => {
      for (const [get] of pairs) get();
      runs++;
    });
    return { pairs, runs: () => runs };
  });
  return {
    run: () => {
      for (let round = 1; round <= 100; round++) {
        batch(() => {
          for (const [, set] of value.pairs) set(round);
        });
      }
    },
    check: () => expect("effect runs", value.runs(), 101),
    dispose,
  };
});

bench("create and dispose 10,000 signals + effects", 10_000, () => ({
  run: () => {
    const { dispose } = inRoot(() => {
      for (let i = 0; i < 10_000; i++) {
        const [n] = createSignal(i);
        createEffect(() => {
          sink += n();
        });
      }
    });
    dispose();
  },
  dispose: () => {},
}));

bench("store: 10,000 writes to one property, 1 effect", 10_000, () => {
  const [state, setState] = createStore({
    items: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: 0 })),
  });
  const { value, dispose } = inRoot(() => {
    let runs = 0;
    createEffect(() => {
      sink += state.items[500].value;
      runs++;
    });
    return { runs: () => runs };
  });
  return {
    run: () => {
      for (let i = 1; i <= 10_000; i++) setState("items", 500, "value", i);
    },
    check: () => expect("effect runs", value.runs(), 10_001),
    dispose,
  };
});

bench("store: 1,000 items, 1 effect per item, update each once", 1000, () => {
  const [state, setState] = createStore({
    items: Array.from({ length: 1000 }, (_, i) => ({ value: i })),
  });
  const { value, dispose } = inRoot(() => {
    let runs = 0;
    for (let i = 0; i < 1000; i++) {
      createEffect(() => {
        sink += state.items[i].value;
        runs++;
      });
    }
    return { runs: () => runs };
  });
  return {
    run: () => {
      for (let i = 0; i < 1000; i++) setState("items", i, "value", -1 - i);
    },
    check: () => expect("effect runs", value.runs(), 2000),
    dispose,
  };
});

console.table(results);
if (sink === 123456789.5) console.log("unreachable");
