import { createEffect, createSignal, For, isServer, onCleanup, Show } from "cajoa";
import { slug } from "./site";

interface Heading {
  id: string;
  text: string;
}

/** "On this page": built in the browser from the headings of the current page. */
export function Toc(props: { path: () => string }) {
  const [items, setItems] = createSignal<Heading[]>([]);
  const [active, setActive] = createSignal("");
  let observer: IntersectionObserver | undefined;
  let first = true;

  createEffect(() => {
    if (isServer()) return;
    props.path(); // run again on every page change

    // Wait one tick, so the new page is already in the document
    const timer = setTimeout(() => {
      observer?.disconnect();

      const headings = Array.from(document.querySelectorAll<HTMLElement>(".content article h2"));
      const used = new Set<string>();
      for (const heading of headings) {
        if (!heading.id) {
          let id = slug(heading.textContent ?? "") || "section";
          while (used.has(id)) id += "-2";
          heading.id = id;
        }
        used.add(heading.id);
      }

      setItems(headings.map((h) => ({ id: h.id, text: h.textContent ?? "" })));
      setActive(headings[0]?.id ?? "");

      const visible = new Set<string>();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) visible.add(entry.target.id);
            else visible.delete(entry.target.id);
          }
          const current = headings.find((h) => visible.has(h.id));
          if (current) setActive(current.id);
        },
        { rootMargin: "-80px 0px -65% 0px" },
      );
      headings.forEach((h) => observer?.observe(h));

      // A link like /docs/router#base-path should scroll there on the first load
      if (first) {
        first = false;
        const id = location.hash.slice(1);
        if (id) document.getElementById(decodeURIComponent(id))?.scrollIntoView();
      }
    }, 0);

    onCleanup(() => clearTimeout(timer));
  });

  onCleanup(() => observer?.disconnect());

  return (
    <aside class="toc" aria-label="On this page">
      <Show when={items().length > 0}>
        <div>
          <h4>On this page</h4>
          <ul>
            <For each={items()}>
              {(item: Heading) => (
                <li>
                  <a href={"#" + item.id} class={() => (active() === item.id ? "active" : "")}>
                    {item.text}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </aside>
  );
}