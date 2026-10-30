import { Code } from "../ui";

export function Forms() {
  return (
    <article>
      <h1>Forms, styles and events</h1>
      <Code
        code={`const [name, setName] = createSignal("");
const [agree, setAgree] = createSignal(false);

<form>
  <input
    placeholder="Name"
    value={name}
    onInput={(e) => setName(e.currentTarget.value)}
  />
  <label>
    <input
      type="checkbox"
      checked={agree}
      onChange={(e) => setAgree(e.currentTarget.checked)}
    />
    I agree
  </label>
  <p style={() => ({ color: agree() ? "green" : "gray", fontSize: "18px" })}>
    Hello, {() => name() || "stranger"}!
  </p>
</form>`}
      />
      <ul>
        <li>
          <code>value</code>, <code>checked</code> and <code>selected</code> are
          set as DOM properties, so they stay in sync even after the user typed.
          Write <code>value</code> after <code>type</code>, <code>min</code> and{" "}
          <code>max</code>.
        </li>
        <li>
          <code>style</code> is a string or an object. The values are strings:{" "}
          <code>{'{ width: "100px" }'}</code>. Cajoa does not add{" "}
          <code>px</code>, so a number would be ignored by the browser. For a
          reactive style, pass a function. An object with signals inside, like{" "}
          <code>{"{ color: color() }"}</code>, is read once.
        </li>
        <li>
          Events are native DOM events. <code>onChange</code> fires when a field
          loses focus, so use <code>onInput</code> for every keystroke.{" "}
          <code>onDoubleClick</code> listens to <code>dblclick</code>.
        </li>
        <li>
          <code>className</code> and <code>htmlFor</code> work. Inline string
          handlers like <code>onclick="..."</code> are ignored.
        </li>
        <li>
          Event handlers are batched: several signal or store updates inside one
          handler cause a single update. After the first <code>await</code>,
          wrap updates in <code>batch</code>.
        </li>
      </ul>

      <h2>Refs</h2>
      <p>
        <code>ref</code> is a function that receives the element once it is
        created. Its props and children are ready, but it is not in the page
        yet, so use <code>onMount</code> if you need to measure it. Signals read
        inside <code>ref</code> are not tracked.
      </p>
      <Code
        code={`function SearchBox() {
  let input: HTMLInputElement | undefined;

  return (
    <div>
      <input ref={(el) => (input = el)} />
      <button onClick={() => input?.focus()}>Focus</button>
    </div>
  );
}`}
      />

      <h2>SVG</h2>
      <p>
        SVG works. <code>svg</code>, <code>path</code>, <code>circle</code>,
        gradients, filters and the other SVG tags are created in the SVG
        namespace. Write attributes as <code>stroke-width="2"</code> or{" "}
        <code>strokeWidth="2"</code>.
      </p>
    </article>
  );
}
