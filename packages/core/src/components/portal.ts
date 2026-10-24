import { getRenderer } from "../renderer";
import type { HostNode } from "../renderer/types";
import { materialize, type Child } from "../runtime/h";
import { onCleanup } from "../reactivity/signal";

type Lazy<T> = T | (() => T);

function resolve<T>(value: Lazy<T>): T {
  return typeof value === "function" ? (value as () => T)() : value;
}

export function Portal(props: { mount?: HostNode; children?: Lazy<Child> }) {
  const r = getRenderer();
  const mount = props.mount ?? r.portalRoot?.();
  if (!mount) {
    throw new Error(
      "<Portal>: nowhere to render into. Pass a `mount` element (this renderer has no default).",
    );
  }

  const start = r.createMarker();
  const end = r.createMarker();
  r.insert(mount, start);
  r.insert(
    mount,
    materialize(() => resolve(props.children ?? null)) as HostNode,
  );
  r.insert(mount, end);

  onCleanup(() => {
    let node = r.nextSibling(start);
    while (node && node !== end) {
      const next = r.nextSibling(node);
      r.remove(node);
      node = next;
    }
    r.remove(start);
    r.remove(end);
  });

  return null;
}
