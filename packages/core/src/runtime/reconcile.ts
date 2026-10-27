import { getRenderer } from "../renderer";

export function longestIncreasingSubsequence(values: number[]): number[] {
  const predecessor = new Array<number>(values.length);
  const tails: number[] = []; 

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v < 0) continue;

    let lo: number;
    if (tails.length === 0 || values[tails[tails.length - 1]] < v) {
      lo = tails.length;
    } else {
      lo = 0;
      let hi = tails.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (values[tails[mid]] < v) lo = mid + 1;
        else hi = mid;
      }
    }
    predecessor[i] = lo > 0 ? tails[lo - 1] : -1;
    tails[lo] = i;
  }

  const result = new Array<number>(tails.length);
  let k = tails.length > 0 ? tails[tails.length - 1] : -1;
  for (let j = tails.length - 1; j >= 0; j--) {
    result[j] = k;
    k = predecessor[k];
  }
  return result;
}

export function reconcile(start: any, end: any, next: any[]) {
  const r = getRenderer();
  const keep = new Set(next);

  const oldIndex = new Map<any, number>();
  let count = 0;
  let cur = r.nextSibling(start);
  while (cur && cur !== end) {
    const after = r.nextSibling(cur);
    if (keep.has(cur)) oldIndex.set(cur, count++);
    else r.remove(cur);
    cur = after;
  }

  const parent = r.parentNode(end)!;
  const n = next.length;

  const positions = new Array<number>(n);
  for (let i = 0; i < n; i++) positions[i] = oldIndex.get(next[i]) ?? -1;
  const stable = new Uint8Array(n);
  for (const i of longestIncreasingSubsequence(positions)) stable[i] = 1;

  const anchors = new Array<any>(n);
  let anchor: any = end;
  for (let i = n - 1; i >= 0; i--) {
    anchors[i] = anchor;
    if (stable[i]) anchor = next[i];
  }


  for (let i = 0; i < n; i++) {
    if (!stable[i]) r.insert(parent, next[i], anchors[i]);
  }
}
