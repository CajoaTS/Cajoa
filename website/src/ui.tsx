import { createSignal } from "cajoa";
import { highlight, type Lang } from "./highlight";

function CopyButton(props: { text: string }) {
  const [copied, setCopied] = createSignal(false);

  return (
    <button
      class="copy"
      onClick={() => {
        navigator.clipboard?.writeText(props.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied() ? "Copied" : "Copy"}
    </button>
  );
}

export function Code(props: { code: string; lang?: Lang; title?: string }) {
  const code = props.code.replace(/^\n+/, "").replace(/\s+$/, "");
  const lang = props.lang ?? "tsx";

  return (
    <figure class="code">
      <div class="code-bar">
        <span>{props.title ?? lang}</span>
        <CopyButton text={code} />
      </div>
      <pre>
        <code>{highlight(code, lang)}</code>
      </pre>
    </figure>
  );
}

export function Callout(props: { title?: string; children?: unknown }) {
  return (
    <aside class="callout">
      {props.title && <strong>{props.title}</strong>}
      <div>{props.children}</div>
    </aside>
  );
}

export function Demo(props: { children?: unknown }) {
  return (
    <div class="demo">
      <div class="demo-label">Try it</div>
      {props.children}
    </div>
  );
}
