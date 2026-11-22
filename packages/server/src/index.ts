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
import { createServerTransfer, dataScript, type Known } from "./transfer";

declare function setTimeout(callback: () => void, ms?: number): unknown;
declare function clearTimeout(id: unknown): void;

type Component = Parameters<typeof render>[0];

export interface RenderOptions {
  url?: string;
  /**
   * Write the markers that hydrate() needs to reuse this HTML in the browser. Set it to true when
   * the page will call hydrate(). The marker format is experimental and can change. Default: false.
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

/** What one pass of a render can have of its own, apart from the options. */
interface Pass {
  head?: HeadData;
  redirect?: ServerRequest["redirect"];
  transfer?: ServerRequest["transfer"];
  deadline?: number;
}

function makeRequest(
  options: RenderOptions,
  track: ServerRequest["track"],
  pass: Pass = {},
): ServerRequest {
  const head = pass.head ?? options.head ?? {};
  head.meta ??= [];
  return {
    url: options.url ?? "/",
    head,
    redirect:
      pass.redirect ?? ((to, status) => options.onRedirect?.(to, status)),
    track,
    transfer: pass.transfer,
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

// How many times renderToStringAsync renders when the page is hydratable. Each level of data that
// depends on other data (a resource inside content that waits for a resource) needs one more.
const MAX_PASSES = 8;

export async function renderToStringAsync(
  app: Component,
  options: AsyncRenderOptions = {},
): Promise<string> {
  if (!options.hydratable) return renderOnce(app, options, {});

  // The browser makes its nodes in the same order as the server did. Content that waits for data goes
  // through steps on the server (loading, then loaded), and those steps make nodes that the browser
  // never makes. So render again, now with the data that was loaded, until nothing new is loaded.
  // The last pass has no steps, and does what hydrate() will do.
  const userHead = options.head;
  const title = userHead?.title;
  const meta = [...(userHead?.meta ?? [])];
  const deadline = Date.now() + (options.timeout ?? 10_000);
  let known: Known[] = [];

  for (let pass = 1; ; pass++) {
    const head: HeadData = { title, meta: [...meta] };
    const redirects: [string, number][] = [];
    const learning = createServerTransfer(known);

    const html = await renderOnce(app, options, {
      head,
      redirect: (to, status) => redirects.push([to, status]),
      transfer: learning.transfer,
      deadline,
    });

    if (learning.learned() === 0 || pass >= MAX_PASSES) {
      // Only the last pass counts: its head and its redirects
      if (userHead) {
        if (head.title !== undefined) userHead.title = head.title;
        userHead.meta = head.meta;
      }
      for (const [to, status] of redirects) options.onRedirect?.(to, status);
      return html + dataScript(learning.output());
    }
    known = learning.known();
  }
}

async function renderOnce(
  app: Component,
  options: AsyncRenderOptions,
  pass: Pass,
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

  const request = makeRequest(
    options,
    () => {
      pending++;
      tracked++;
      let done = false;
      return () => {
        if (done) return;
        done = true;
        pending--;
        settle();
      };
    },
    pass,
  );

  acquire();
  let mounted: ReturnType<typeof mount> | undefined;
  try {
    const current = mount(app, request, settle);
    mounted = current;
    const deadline = pass.deadline ?? Date.now() + timeout;

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
