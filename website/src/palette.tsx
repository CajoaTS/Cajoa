import {
  createEffect,
  createMemo,
  createSignal,
  For,
  isServer,
  navigate,
  onCleanup,
  onMount,
  Show,
} from "cajoa";
import { Icon } from "./icons";
import { search, type Entry } from "./search";

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function SearchButton(props: { onOpen: () => void }) {
  const [mod, setMod] = createSignal("Ctrl");

  onMount(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setMod("\u2318");
  });

  return (
    <button class="search-button" onClick={props.onOpen} aria-label="Search the docs">
      <Icon name="search" size={16} />
      <span class="search-label">Search docs</span>
      <kbd>{mod()} K</kbd>
    </button>
  );
}

export function Palette(props: { open: () => boolean; setOpen: (open: boolean) => void }) {
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal(0);
  const results = createMemo(() => search(query()));
  let input: HTMLInputElement | undefined;

  // Each time it opens: start clean, lock the page scroll and focus the input
  createEffect(() => {
    if (isServer() || !props.open()) return;
    setQuery("");
    setActive(0);
    document.body.classList.add("no-scroll");
    const timer = setTimeout(() => input?.focus(), 0);
    onCleanup(() => {
      clearTimeout(timer);
      document.body.classList.remove("no-scroll");
    });
  });

  // Ctrl+K or Cmd+K opens and closes it. "/" opens it when you are not typing.
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        props.setOpen(!props.open());
      } else if (e.key === "/" && !isTyping(e.target)) {
        e.preventDefault();
        props.setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    onCleanup(() => window.removeEventListener("keydown", onKey));
  });

  const go = (entry: Entry | undefined) => {
    if (!entry) return;
    props.setOpen(false);
    navigate(entry.href);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const count = results().length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (count ? (i + 1) % count : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (count ? (i - 1 + count) % count : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results()[active()]);
    } else if (e.key === "Escape") {
      props.setOpen(false);
    }
  };

  return (
    <div class="palette-root">
      <Show when={props.open()}>
        <div class="palette-backdrop" onClick={() => props.setOpen(false)}>
          <div
            class="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Search the docs"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div class="palette-input">
              <Icon name="search" />
              <input
                ref={(el) => (input = el)}
                type="search"
                placeholder="Search the docs..."
                aria-label="Search"
                autoComplete="off"
                spellCheck="false"
                value={query}
                onInput={(e) => {
                  setQuery(e.currentTarget.value);
                  setActive(0);
                }}
              />
              <kbd>Esc</kbd>
            </div>
            <ul class="palette-results">
              <For each={results()}>
                {(entry: Entry) => (
                  <li
                    class={() => (results()[active()] === entry ? "active" : "")}
                    onMouseEnter={() => setActive(results().indexOf(entry))}
                    onClick={() => go(entry)}
                  >
                    <span class="palette-kind">{entry.kind}</span>
                    <span class="palette-title">{entry.title}</span>
                    <span class="palette-text">{entry.text}</span>
                  </li>
                )}
              </For>
            </ul>
            <Show when={results().length === 0}>
              <p class="palette-empty">No results. Try "signal", "router" or "store".</p>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  );
}