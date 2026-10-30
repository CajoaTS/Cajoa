import { Callout, Code } from "../ui";

export function Reactivity() {
  return (
    <article>
      <h1>Reactivity</h1>
      <p>
        State lives in <strong>signals</strong>. When a signal changes, only the
        things that read it are updated.
      </p>

      <h2>Signals</h2>
      <Code
        code={`const [count, setCount] = createSignal(0);

count();                 // read: 0
setCount(5);             // write a value
setCount((n) => n + 1);  // or compute it from the old value`}
      />

      <h2>Effects</h2>
      <p>An effect runs now, and again each time a signal it read changes.</p>
      <Code
        code={`createEffect(() => {
  console.log("count is", count());
});

createEffect(() => {
  const id = setInterval(tick, 1000);
  onCleanup(() => clearInterval(id)); // runs before the next run, and when the effect is removed
});`}
      />

      <h2>Memos</h2>
      <p>
        A memo is a cached value. It is computed when it is read, and it only
        notifies when the result changes.
      </p>
      <Code code={`const double = createMemo(() => count() * 2);`} />

      <h2>Batching</h2>
      <p>
        <code>batch</code> groups several writes into one update. Event handlers
        are batched for you, up to the first <code>await</code>.
      </p>
      <Code
        code={`batch(() => {
  setFirst("Ada");
  setLast("Lovelace");
}); // effects run once`}
      />

      <h2>Reactive JSX</h2>
      <p>
        With the Vite plugin, write plain JSX. Calls and property reads update
        by themselves:
      </p>
      <Code
        code={`<p>Double: {count() * 2}</p>
<p class={count() % 2 ? "odd" : "even"}>{state.user.name}</p>`}
      />
      <p>
        At build time the plugin wraps an expression that has a function call or
        a property read in a function. For example,{" "}
        <code>{"{count() * 2}"}</code> becomes{" "}
        <code>{"{() => (count() * 2)}"}</code>. This works for the children and
        attributes of DOM elements (not <code>ref</code>, <code>key</code> and{" "}
        <code>on*</code>), the children of your own components, and{" "}
        <code>when</code> and <code>each</code> of <code>Show</code>,{" "}
        <code>Match</code> and <code>For</code>.
      </p>
      <p>
        It does <strong>not</strong> change the props of your own components.
        They receive plain values. To pass a live value, pass the signal itself
        (<code>{"<Greeting name={name} />"}</code>) or a function.
      </p>
      <p>Without the plugin, two rules apply:</p>
      <ul>
        <li>
          Pass the signal, do not call it. <code>{"{count}"}</code> is reactive,{" "}
          <code>{"{count()}"}</code> is read once. For computed values, pass a
          function: <code>{"{() => count() * 2}"}</code>.
        </li>
        <li>
          Children of <code>Show</code> are a function:{" "}
          <code>{"<Show when={on}>{() => <p>Hi</p>}</Show>"}</code>.
        </li>
      </ul>

      <h2>Untrack and selectors</h2>
      <p>
        <code>untrack(fn)</code> reads signals without subscribing.{" "}
        <code>createSelector(source)</code> returns <code>isSelected(key)</code>
        . When the source changes, only the old and the new key wake up, so
        choosing a row in a big list stays cheap.
      </p>
      <Code
        code={`const [selected, setSelected] = createSignal<number | null>(null);
const isSelected = createSelector(selected);

<For each={rows}>
  {(row) => <tr class={isSelected(row.id) ? "danger" : ""}>...</tr>}
</For>`}
      />

      <Callout title="Glitch-free">
        When several signals or memos change together, each effect runs once,
        after everything it depends on is up to date. It never sees a
        half-updated state. An update started inside an effect is queued and
        runs after that effect finishes. If an effect keeps changing a signal
        that it also reads, Cajoa stops with an error instead of looping
        forever.
      </Callout>
    </article>
  );
}
