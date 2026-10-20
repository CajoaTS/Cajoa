import { createSignal } from "cajoa";

export function CopyCommand(props: { command: string }) {
  const [copied, setCopied] = createSignal(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard is not available
    }
  };

  return (
    <div class="code">
      <code>$ {props.command}</code>
      <button class="copy" onClick={copy} aria-live="polite">
        {copied() ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
