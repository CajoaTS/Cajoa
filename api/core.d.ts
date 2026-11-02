type Cleanup = () => void;
declare function batch<T>(fn: () => T): T;
declare function createSignal<T>(value: T): readonly [() => T, (next: T | ((prev: T) => T)) => void];
declare function createEffect(fn: () => void): void;
declare function createMemo<T>(fn: () => T): () => T;
declare function createSelector<T>(source: () => T): (key: T) => boolean;
declare function onCleanup(fn: Cleanup): void;
declare function createRoot<T>(fn: (dispose: () => void) => T): T;
declare function onMount(fn: () => void): void;
declare function untrack<T>(fn: () => T): T;
declare function catchError<T>(fn: () => T, handler: (error: unknown) => void): T | undefined;
interface Context<T> {
    readonly id: symbol;
    readonly defaultValue: T;
}
declare function createContext<T>(defaultValue: T): Context<T>;
declare function provide<T, R>(ctx: Context<T>, value: T, fn: () => R): R;
declare function useContext<T>(ctx: Context<T>): T;

interface Resource<T> {
    (): T | undefined;
    loading: () => boolean;
    error: () => unknown;
}
interface ResourceActions<T> {
    refetch: () => void;
    mutate(value: T | undefined): void;
}
type ResourceTuple<T> = [Resource<T>, ResourceActions<T>];
declare function createResource<T>(fetcher: () => T | Promise<T>): ResourceTuple<T>;
declare function createResource<T, S>(source: () => S | false | null | undefined, fetcher: (source: S) => T | Promise<T>): ResourceTuple<T>;

type Update<V> = V extends readonly unknown[] ? V : V extends object ? Partial<V> : V;
type ValueOrUpdate<V> = Update<V> | ((prev: V) => V);
interface SetStoreFunction<T> {
    (partial: Partial<T>): void;
    (edit: (draft: T) => Partial<T> | void): void;
    <K1 extends keyof T>(k1: K1, value: ValueOrUpdate<T[K1]>): void;
    <K1 extends keyof T, K2 extends keyof T[K1]>(k1: K1, k2: K2, value: ValueOrUpdate<T[K1][K2]>): void;
    <K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(k1: K1, k2: K2, k3: K3, value: ValueOrUpdate<T[K1][K2][K3]>): void;
    <K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2], K4 extends keyof T[K1][K2][K3]>(k1: K1, k2: K2, k3: K3, k4: K4, value: ValueOrUpdate<T[K1][K2][K3][K4]>): void;
}
declare function createStore<T extends object>(initial: T): [T, SetStoreFunction<T>];
declare function unwrap<T>(value: T): T;

type HostNode = object;
interface Renderer<N = any> {
    createElement(tag: string): N;
    createText(value: string): N;
    createMarker(): N;
    createFragment(): N;
    isNode(value: unknown): value is N;
    insert(parent: N, node: N, anchor?: N | null): void;
    remove(node: N): void;
    nextSibling(node: N): N | null;
    parentNode(node: N): N | null;
    portalRoot?(): N;
    clear(parent: N): void;
    setProp(el: N, name: string, value: unknown): void;
    isServer?: boolean;
}

type Child = string | number | boolean | null | undefined | HostNode | (() => unknown) | Child[];
declare function h(tag: string, props: Record<string, any> | null, ...children: Child[]): HostNode;

declare function render(component: () => HostNode, container: HostNode): () => void;

type Lazy$4<T> = T | (() => T);
declare function Show<T>(props: {
    when: Lazy$4<T>;
    children?: Lazy$4<Child>;
    fallback?: Lazy$4<Child>;
}): () => string | number | boolean | object | null;

declare function For<T>(props: {
    each: T[] | (() => T[]);
    children: (item: T, index: number) => HostNode;
    key?: (item: T, index: number) => unknown;
    /** Shown when the list is empty. */
    fallback?: Child | (() => Child);
}): () => Child;

type Lazy$3<T> = T | (() => T);
declare function ErrorBoundary(props: {
    fallback: Child | ((error: unknown, reset: () => void) => Child);
    children?: Lazy$3<Child>;
    onError?: (error: unknown) => void;
}): () => unknown;

type Lazy$2<T> = T | (() => T);
interface MatchDef {
    __match: true;
    when: Lazy$2<unknown>;
    children?: Lazy$2<Child>;
}
declare function Match(props: {
    when: Lazy$2<unknown>;
    children?: Lazy$2<Child>;
}): MatchDef;
declare function Switch(props: {
    fallback?: Lazy$2<Child>;
    children?: unknown;
}): () => string | number | boolean | object | null;

type Target = string | ((props: any) => unknown) | null | undefined | false;
declare function Dynamic(props: {
    is: Target | (() => Target);
    [key: string]: unknown;
}): () => any;

type Lazy$1<T> = T | (() => T);
declare function Portal(props: {
    mount?: HostNode;
    children?: Lazy$1<Child>;
}): null;

type Lazy<T> = T | (() => T);
declare function Suspense(props: {
    fallback?: Lazy<Child>;
    children?: Lazy<Child>;
}): () => unknown;

type Component<P> = (props: P) => unknown;
declare function lazy<P = Record<string, unknown>>(loader: () => Promise<{
    default: Component<P>;
} | Component<P>>): Component<P>;

declare function jsx(type: any, props: Record<string, any> | null): any;
declare const jsxs: typeof jsx;
declare const jsxDEV: typeof jsx;
declare function Fragment(props: {
    children?: Child;
}): any;

declare function setRenderer(renderer: Renderer | null): void;
declare function getRenderer(): Renderer;
declare function currentRenderer(): Renderer | null;
declare function isServer(): boolean;

interface HeadMeta {
    name?: string;
    property?: string;
    content: string;
}
/** The page title and meta tags that <Title> and <Meta> collect while rendering on the server. */
interface HeadData {
    title?: string;
    meta?: HeadMeta[];
}
/** What components can learn about the request that is being rendered on the server. */
interface ServerRequest {
    /** The URL of the request (path and query), for example "/users/42?tab=posts". */
    url: string;
    /** Filled by <Title> and <Meta> while rendering. */
    head: HeadData;
    /** <Navigate> asks the server to redirect. */
    redirect(to: string, status: number): void;
    /**
     * Tell renderToStringAsync that there is async work (for example a resource) to wait for.
     * Returns the function to call when the work is done.
     */
    track(): () => void;
}
declare const ServerContext: Context<ServerRequest | null>;

export { Dynamic, ErrorBoundary, For, Fragment, Match, Portal, ServerContext, Show, Suspense, Switch, batch, catchError, createContext, createEffect, createMemo, createResource, createRoot, createSelector, createSignal, createStore, currentRenderer, getRenderer, h, isServer, jsx, jsxDEV, jsxs, lazy, onCleanup, onMount, provide, render, setRenderer, untrack, unwrap, useContext };
export type { Child, Context, HeadData, HeadMeta, HostNode, MatchDef, Renderer, Resource, ResourceActions, ServerRequest, SetStoreFunction };
