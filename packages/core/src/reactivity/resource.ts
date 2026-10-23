import {
  batch,
  createEffect,
  createSignal,
  onCleanup,
  untrack,
} from "./signal";

export interface Resource<T> {
  (): T | undefined;
  loading: () => boolean;
  error: () => unknown;
}

export interface ResourceActions<T> {
  refetch: () => void;
  mutate(value: T | undefined): void;
}

type ResourceTuple<T> = [Resource<T>, ResourceActions<T>];

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof (value as { then?: unknown } | null | undefined)?.then === "function"
  );
}

export function createResource<T>(
  fetcher: () => T | Promise<T>,
): ResourceTuple<T>;
export function createResource<T, S>(
  source: () => S | false | null | undefined,
  fetcher: (source: S) => T | Promise<T>,
): ResourceTuple<T>;
export function createResource(a: unknown, b?: unknown): any {
  const hasSource = typeof b === "function";
  const source = (hasSource ? a : () => true) as () => unknown;
  const fetcher = (hasSource ? b : a) as (source: unknown) => unknown;

  const [data, setData] = createSignal<unknown>(undefined);
  const [failure, setFailure] = createSignal<{ error: unknown } | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [version, setVersion] = createSignal(0);
  let run = 0;

  const finish = (
    id: number,
    outcome: { value: unknown } | { error: unknown },
  ) => {
    if (id !== run) return;
    batch(() => {
      setLoading(false);
      if ("error" in outcome) {
        setFailure({ error: outcome.error });
      } else {
        setFailure(null);
        setData(() => outcome.value);
      }
    });
  };

  createEffect(() => {
    const s = source();
    version(); 

    run++;
    const id = run;
    onCleanup(() => {
      run++;
    });

    if (s === false || s === null || s === undefined) {
      batch(() => {
        setLoading(false);
        setFailure(null);
        setData(() => undefined);
      });
      return;
    }

    setLoading(true);
    setFailure(null);

    let result: unknown;
    try {
      result = untrack(() => fetcher(s));
    } catch (error) {
      finish(id, { error });
      return;
    }

    if (isPromiseLike(result)) {
      result.then(
        (value) => finish(id, { value }),
        (error) => finish(id, { error }),
      );
    } else {
      finish(id, { value: result });
    }
  });

  const resource = (() => {
    const failed = failure();
    if (failed) throw failed.error;
    return data();
  }) as Resource<unknown>;
  resource.loading = loading;
  resource.error = () => failure()?.error;

  return [
    resource,
    {
      refetch: () => setVersion((v) => v + 1),
      mutate: (value: unknown) =>
        batch(() => {
          setFailure(null);
          setData(() => value);
        }),
    },
  ];
}
