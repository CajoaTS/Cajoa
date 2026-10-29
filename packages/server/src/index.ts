import {
  catchError,
  currentRenderer,
  provide,
  render,
  ServerContext,
  setRenderer,
  type Renderer,
  type ServerRequest,
} from "@cajoa/core";
import { serialize } from "./serialize";
import { stringRenderer } from "./string-renderer";


declare function setTimeout(callback: () => void, ms?: number): unknown;
declare function clearTimeout(id: unknown): void;

type Component = Parameters<typeof render>[0];

export interface RenderOptions {
  url?: string;
  hydratable?: boolean;
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
  return {
    url: options.url ?? "/",
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
      hydratable: options.hydratable ?? true,
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
      hydratable: options.hydratable ?? true,
    });
  } finally {
    mounted?.dispose();
    release();
  }
}
