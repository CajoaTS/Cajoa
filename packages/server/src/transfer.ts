import type { ResourceTransfer } from "@cajoa/core";

/** Something that a resource loaded, kept for the next pass. */
export type Known = { key: string; hint: string } & (
  | { value: unknown }
  | { error: unknown }
);

export interface ServerTransfer {
  transfer: ResourceTransfer;
  /** How many resources fetched a value in this pass (instead of reusing one from an earlier pass). */
  learned(): number;
  /** Everything that is known, to hand to the next pass. */
  known(): Known[];
  /** What the browser needs: one item per createResource, in order. */
  output(): ([string, unknown] | null)[];
}

/**
 * Remembers what the resources of one pass loaded. The first pass has nothing, so its resources
 * fetch. A later pass gets what the earlier ones learned, so those resources have their value at once.
 */
export function createServerTransfer(before: Known[]): ServerTransfer {
  // The same source and the same fetcher: the first one that asks gets the first value
  const queues = new Map<string, Known[]>();
  for (const item of before) {
    const id = item.key + "\n" + item.hint;
    const queue = queues.get(id);
    if (queue) queue.push(item);
    else queues.set(id, [item]);
  }

  const slots: { entry?: Known }[] = [];
  let learned = 0;

  return {
    transfer: {
      open() {
        const slot: { entry?: Known } = {};
        slots.push(slot);
        return {
          take(key, hint) {
            const item = queues.get(key + "\n" + hint)?.shift();
            if (!item) return undefined;
            return "error" in item
              ? { error: item.error }
              : { value: item.value };
          },
          set(key, hint, value, loaded) {
            slot.entry = { key, hint, value };
            if (loaded) learned++;
          },
          fail(key, hint, error) {
            slot.entry = { key, hint, error };
          },
          clear() {
            slot.entry = undefined;
          },
        };
      },
    },
    learned: () => learned,
    known() {
      const result: Known[] = [];
      for (const slot of slots) if (slot.entry) result.push(slot.entry);
      // Keep what this pass did not ask for, a later pass may need it
      for (const queue of queues.values()) result.push(...queue);
      return result;
    },
    output() {
      const items = slots.map((slot): [string, unknown] | null => {
        const entry = slot.entry;
        if (!entry || "error" in entry) return null;
        try {
          // Only what JSON can write goes to the browser
          return JSON.stringify(entry.value) === undefined
            ? null
            : [entry.key, entry.value];
        } catch {
          return null;
        }
      });
      while (items.length && items[items.length - 1] === null) items.pop();
      return items;
    },
  };
}

/** The <script> that carries the data to hydrate(). Empty when there is nothing to send. */
export function dataScript(items: ([string, unknown] | null)[]): string {
  if (!items.length) return "";
  // < > & and the two line separators cannot end the script or the string, so the data cannot break the page
  const json = JSON.stringify(items)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return '<script type="application/json" data-cj-data>' + json + "</script>";
}
