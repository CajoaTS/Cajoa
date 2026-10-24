declare const console:
  | { warn(...args: unknown[]): void; error(...args: unknown[]): void }
  | undefined;

let muted = 0;

export function isDev(): boolean {
  return (
    (globalThis as unknown as { __CAJOA_DEV__?: boolean }).__CAJOA_DEV__ ===
    true
  );
}

export function quietly<T>(fn: () => T): T {
  muted++;
  try {
    return fn();
  } finally {
    muted--;
  }
}

export function warn(message: string): void {
  if (muted === 0 && isDev() && typeof console !== "undefined") {
    console.warn(`[cajoa] ${message}`);
  }
}

export function logError(message: string, error: unknown): void {
  if (isDev() && typeof console !== "undefined")
    console.error(`[cajoa] ${message}`, error);
}
