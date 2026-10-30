import { Code } from "../ui";

export function TypeScriptPage() {
  return (
    <article>
      <h1>TypeScript</h1>
      <p>
        JSX is typed. The editor knows every HTML and SVG element, its
        attributes, and what each event gives you.
      </p>
      <Code
        code={`<input
  value={name()}
  onInput={(e) => setName(e.currentTarget.value)} // e.currentTarget is an HTMLInputElement
/>`}
      />
      <ul>
        <li>
          Every attribute accepts a value <strong>or</strong> a function that
          returns it (<code>{"class={() => ..."}</code>). Events,{" "}
          <code>ref</code> and <code>children</code> do not.
        </li>
        <li>
          <code>style</code> is a string or an object, and the values are
          strings. Cajoa does not add <code>px</code>.
        </li>
        <li>
          ARIA booleans are strings: <code>aria-hidden="true"</code>. Use
          camelCase for multi-word attributes (<code>tabIndex</code>,{" "}
          <code>readOnly</code>, <code>maxLength</code>), and <code>class</code>{" "}
          or <code>className</code>, <code>for</code> or <code>htmlFor</code>.
        </li>
        <li>
          <code>data-*</code> attributes and custom elements (
          <code>{"<my-widget>"}</code>) are accepted.
        </li>
        <li>
          Rare SVG elements, such as filter primitives and animation, accept any
          attribute.
        </li>
        <li>
          The types live in <code>@cajoa/dom</code>. <code>JSX</code>,{" "}
          <code>CSSProperties</code> and <code>TargetedEvent</code> are exported
          from <code>cajoa</code>.
        </li>
      </ul>

      <h2>Dev mode</h2>
      <p>
        The Vite plugin turns on dev mode on the dev server only. In dev mode,
        Cajoa warns when <code>onCleanup</code> or <code>useContext</code> is
        called outside a component, and when <code>{"<For>"}</code> finds
        duplicate keys. It also logs every error caught by an error boundary.
        Production builds log nothing. Without the plugin, set{" "}
        <code>globalThis.__CAJOA_DEV__ = true</code> yourself.
      </p>
    </article>
  );
}
