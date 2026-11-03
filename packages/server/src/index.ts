import {
  catchError,
  currentRenderer,
  provide,
  render,
  ServerContext,
  setRenderer,
  type Renderer,
  type HeadData,
  type ServerRequest,
} from "@cajoa/core";
import { serialize } from "./serialize";
import { stringRenderer } from "./string-renderer";

declare function setTimeout(callback: () => void, ms?: number): unknown;
declare function clearTimeout(id: unknown): void;

type Component = Parameters<typeof render>[0];

export interface RenderOptions {
  url?: string;
  /**
   * Write comment markers that a future hydrate() will use. Experimental: there is no hydrate() yet,
   * and the marker format can change. Default: false.
   */
  hydratable?: boolean;
  head?: HeadData;
  onRedirect?: (to: string, status: number) => void;
}

export interface AsyncRenderOptions extends RenderOptions {
  timeout?: number;
}

let users = 0;
let previous: Renderer | null = null;

function acquire() {
  if (users++ === 0) {
    previous = currentRenderer();
    setRenderer(stringRenderer);
  }
}

function release() {
  if (--users === 0) {
    setRenderer(previous);
    previous = null;
  }
}

function makeRequest(
  options: RenderOptions,
  track: ServerRequest["track"],
): ServerRequest {
  const head = options.head ?? {};
  head.meta ??= [];
  return {
    url: options.url ?? "/",
    head,
    redirect: (to, status) => options.onRedirect?.(to, status),
    track,
  };
}

function mount(app: Component, request: ServerRequest, onError: () => void) {
  const container = stringRenderer.createFragment();
  const errors: unknown[] = [];
  let dispose: () => void = () => {};

  catchError(
    () => {
      dispose = render(() => provide(ServerContext, request, app), container);
    },
    (error) => {
      errors.push(error);
      onError();
    },
  );

  return { container, errors, dispose: () => dispose() };
}

export function renderToString(
  app: Component,
  options: RenderOptions = {},
): string {
  acquire();
  let mounted: ReturnType<typeof mount> | undefined;
  try {
    const current = mount(
      app,
      makeRequest(options, () => () => {}),
      () => {},
    );
    mounted = current;
    if (current.errors.length) throw current.errors[0];
    return serialize(current.container, {
      hydratable: options.hydratable ?? false,
    });
  } finally {
    mounted?.dispose();
    release();
  }
}

export async function renderToStringAsync(
  app: Component,
  options: AsyncRenderOptions = {},
): Promise<string> {
  const timeout = options.timeout ?? 10_000;
  let pending = 0;
  let tracked = 0;
  let wake: (() => void) | undefined;

  const settle = () => {
    const w = wake;
    wake = undefined;
    w?.();
  };

  const request = makeRequest(options, () => {
    pending++;
    tracked++;
    let done = false;
    return () => {
      if (done) return;
      done = true;
      pending--;
      settle();
    };
  });

  acquire();
  let mounted: ReturnType<typeof mount> | undefined;
  try {
    const current = mount(app, request, settle);
    mounted = current;
    const deadline = Date.now() + timeout;

    for (;;) {
      if (current.errors.length) throw current.errors[0];

      if (pending === 0) {
        if (tracked === 0) break;

        await new Promise<void>((resolve) => setTimeout(resolve, 0));
        if (current.errors.length) throw current.errors[0];
        if (pending === 0) break;
        continue;
      }

      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new Error(
          `renderToStringAsync: timed out after ${timeout}ms, still waiting for ${pending} resource(s).`,
        );
      }
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          wake = undefined;
          resolve();
        }, remaining);
        wake = () => {
          clearTimeout(timer);
          resolve();
        };
      });
    }

    return serialize(current.container, {
      hydratable: options.hydratable ?? false,
    });
  } finally {
    mounted?.dispose();
    release();
  }
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Turns the head object into <title> and <meta> tags, ready to put in your HTML. */
export function headToString(head: HeadData): string {
  const parts: string[] = [];
  if (head.title) parts.push("<title>" + escapeHtml(head.title) + "</title>");
  for (const meta of head.meta ?? []) {
    const key =
      meta.name !== undefined
        ? 'name="' + escapeHtml(meta.name) + '"'
        : 'property="' + escapeHtml(meta.property ?? "") + '"';
    parts.push("<meta " + key + ' content="' + escapeHtml(meta.content) + '">');
  }
  return parts.join("\n");
}
