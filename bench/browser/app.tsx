import { batch, createSelector, createSignal, For, render } from "cajoa";

interface Row {
  id: number;
  label: () => string;
  setLabel: (next: string | ((prev: string) => string)) => void;
}

const adjectives = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
];
const colours = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "orange",
];
const nouns = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
];

let seed = 1;
const random = (max: number) => {
  seed = (seed * 16807) % 2147483647;
  return seed % max;
};

let nextId = 1;
function buildData(count: number): Row[] {
  const rows: Row[] = [];
  for (let i = 0; i < count; i++) {
    const [label, setLabel] = createSignal(
      `${adjectives[random(adjectives.length)]} ${colours[random(colours.length)]} ${nouns[random(nouns.length)]}`,
    );
    rows.push({ id: nextId++, label, setLabel });
  }
  return rows;
}

const [data, setData] = createSignal<Row[]>([]);
const [selected, setSelected] = createSignal<number | null>(null);
const isSelected = createSelector(selected);

const ops = {
  create: (n: number) =>
    batch(() => {
      setData(buildData(n));
      setSelected(null);
    }),
  append: (n: number) => setData((d) => [...d, ...buildData(n)]),
  update: () => {
    const d = data();
    batch(() => {
      for (let i = 0; i < d.length; i += 10) d[i].setLabel((l) => l + " !!!");
    });
  },
  select: () => setSelected(data()[1].id),
  swap: () =>
    setData((d) => {
      if (d.length < 999) return d;
      const copy = d.slice();
      const tmp = copy[1];
      copy[1] = copy[998];
      copy[998] = tmp;
      return copy;
    }),
  remove: () => setData((d) => d.filter((_, i) => i !== 1)),
  clear: () => setData([]),
};

render(
  () => (
    <table>
      <tbody>
        <For each={data}>
          {(row: Row) => (
            <tr class={() => (isSelected(row.id) ? "danger" : "")}>
              <td>{row.id}</td>
              <td>{row.label}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  ),
  document.getElementById("app")!,
);

const scenarios: Record<string, { setup?: () => void; run: () => void }> = {
  "create 1,000 rows": { run: () => ops.create(1000) },
  "create 10,000 rows": { run: () => ops.create(10000) },
  "append 1,000 rows": {
    setup: () => ops.create(1000),
    run: () => ops.append(1000),
  },
  "update every 10th row": { setup: () => ops.create(1000), run: ops.update },
  "select row": { setup: () => ops.create(1000), run: ops.select },
  "swap rows": { setup: () => ops.create(1000), run: ops.swap },
  "select row, 10,000 rows": {
    setup: () => ops.create(10000),
    run: ops.select,
  },
  "swap rows, 10,000 rows": { setup: () => ops.create(10000), run: ops.swap },
  "remove row": { setup: () => ops.create(1000), run: ops.remove },
  "clear 1,000 rows": { setup: () => ops.create(1000), run: ops.clear },
};

(window as any).__scenarios = Object.keys(scenarios);

(window as any).__measure = (name: string, iterations: number) => {
  const scenario = scenarios[name];
  const samples: number[] = [];
  for (let i = 0; i < iterations + 3; i++) {
    ops.clear();
    scenario.setup?.();
    document.body.offsetHeight;
    const start = performance.now();
    scenario.run();
    document.body.offsetHeight;
    const elapsed = performance.now() - start;
    if (i >= 3) samples.push(elapsed);
  }
  ops.clear();
  return samples;
};
