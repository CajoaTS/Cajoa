import { test, expect } from "vitest";
import { transformJsx } from "../packages/cajoa/src/compiler";

const run = (code: string) => transformJsx(code, "file.tsx")?.code ?? code;
const none = (code: string) => transformJsx(code, "file.tsx");

const SHOW = 'import { Show } from "cajoa";\n';
const FOR = 'import { For } from "cajoa";\n';

test("wraps a call in a DOM child", () => {
  expect(run("const a = <p>{count()}</p>;")).toBe(
    "const a = <p>{() => (count())}</p>;",
  );
});

test("leaves identifiers and functions alone", () => {
  expect(none("const a = <p>{count}{() => count()}</p>;")).toBeNull();
});

test("wraps calls in DOM attributes", () => {
  expect(run('const a = <p class={active() ? "a" : "b"} />;')).toBe(
    'const a = <p class={() => (active() ? "a" : "b")} />;',
  );
});

test("never wraps ref, key or on* props", () => {
  expect(
    none(
      "const a = <button onClick={make()} ref={grab()} key={id()}>x</button>;",
    ),
  ).toBeNull();
});

test("wraps a style object that contains a call", () => {
  expect(run("const a = <p style={{ color: color() }} />;")).toBe(
    "const a = <p style={() => ({ color: color() })} />;",
  );
  expect(none('const a = <p style={{ color: "red" }} />;')).toBeNull();
});

test("does not touch props of your own components, but wraps their children", () => {
  expect(none("const a = <Counter start={count()} />;")).toBeNull();
  expect(run("const a = <Layout>{count()}</Layout>;")).toBe(
    "const a = <Layout>{() => (count())}</Layout>;",
  );
});

test("Show: wraps when and makes a single child lazy", () => {
  expect(run(SHOW + "const a = <Show when={on()}><p>Hi</p></Show>;")).toBe(
    SHOW + "const a = <Show when={() => (on())}>{() => (<p>Hi</p>)}</Show>;",
  );
});

test("Show: fallback elements are lazy", () => {
  expect(
    run(
      SHOW +
        "const a = <Show when={on} fallback={<p>No</p>}><b>Yes</b></Show>;",
    ),
  ).toBe(
    SHOW +
      "const a = <Show when={on} fallback={() => (<p>No</p>)}>{() => (<b>Yes</b>)}</Show>;",
  );
});

test("Show: function children are left alone", () => {
  expect(
    none(SHOW + "const a = <Show when={on}>{() => <p>x</p>}</Show>;"),
  ).toBeNull();
});

test("Show: several children become one lazy fragment", () => {
  expect(run(SHOW + "const a = <Show when={on}><b>a</b><i>b</i></Show>;")).toBe(
    SHOW + "const a = <Show when={on}>{() => (<><b>a</b><i>b</i></>)}</Show>;",
  );
});

test("For: wraps each and keeps the item function", () => {
  expect(
    run(
      FOR + "const a = <For each={todos()}>{(t) => <li>{t.text}</li>}</For>;",
    ),
  ).toBe(
    FOR +
      "const a = <For each={() => (todos())}>{(t) => <li>{() => (t.text)}</li>}</For>;",
  );
});

test("Show is only special when imported from cajoa", () => {
  expect(none("const a = <Show when={on()}><p>Hi</p></Show>;")).toBeNull();
});

test("aliased imports are recognised", () => {
  const imp = 'import { Show as S } from "cajoa";\n';
  expect(run(imp + "const a = <S when={on}><p>Hi</p></S>;")).toBe(
    imp + "const a = <S when={on}>{() => (<p>Hi</p>)}</S>;",
  );
});

test("fragments wrap calls in their children", () => {
  expect(run("const a = <>{count()}</>;")).toBe(
    "const a = <>{() => (count())}</>;",
  );
});

test("ignores other files, node_modules and bad syntax", () => {
  const code = "const a = <p>{x()}</p>;";
  expect(transformJsx(code, "file.ts")).toBeNull();
  expect(transformJsx(code, "/proj/node_modules/pkg/file.tsx")).toBeNull();
  expect(transformJsx("const a = <p>;", "file.tsx")).toBeNull();
  expect(transformJsx(code, "file.tsx?v=1")?.code).toBe(
    "const a = <p>{() => (x())}</p>;",
  );
});

test("returns a source map", () => {
  expect(transformJsx("const a = <p>{x()}</p>;", "file.tsx")?.map).toBeTruthy();
});

const EB = 'import { ErrorBoundary } from "cajoa";\n';

test("ErrorBoundary: children and fallback elements are lazy", () => {
  expect(
    run(
      EB +
        "const a = <ErrorBoundary fallback={<p>Oops</p>}><Page /></ErrorBoundary>;",
    ),
  ).toBe(
    EB +
      "const a = <ErrorBoundary fallback={() => (<p>Oops</p>)}>{() => (<Page />)}</ErrorBoundary>;",
  );
});

test("ErrorBoundary: function fallbacks and children are left alone", () => {
  expect(
    none(
      EB +
        "const a = <ErrorBoundary fallback={(e) => <p>oops</p>}>{() => <Page />}</ErrorBoundary>;",
    ),
  ).toBeNull();
});

const SW = 'import { Switch, Match } from "cajoa";\n';

test("Switch and Match: when is wrapped and the branches are lazy", () => {
  expect(
    run(
      SW +
        "const a = <Switch fallback={<p>None</p>}><Match when={a()}><A /></Match><Match when={b}><B /></Match></Switch>;",
    ),
  ).toBe(
    SW +
      "const a = <Switch fallback={() => (<p>None</p>)}><Match when={() => (a())}>{() => (<A />)}</Match><Match when={b}>{() => (<B />)}</Match></Switch>;",
  );
});

test("Portal: children are lazy but mount is left alone", () => {
  const imp = 'import { Portal } from "cajoa";\n';
  expect(
    run(imp + "const a = <Portal mount={document.body}><Modal /></Portal>;"),
  ).toBe(
    imp +
      "const a = <Portal mount={document.body}>{() => (<Modal />)}</Portal>;",
  );
});

test("Suspense: fallback and children are lazy", () => {
  const imp = 'import { Suspense } from "cajoa";\n';
  expect(
    run(
      imp +
        "const a = <Suspense fallback={<p>Loading</p>}><Page /></Suspense>;",
    ),
  ).toBe(
    imp +
      "const a = <Suspense fallback={() => (<p>Loading</p>)}>{() => (<Page />)}</Suspense>;",
  );
});

test("Dynamic: is is wrapped, other props are not, children are reactive", () => {
  const imp = 'import { Dynamic } from "cajoa";\n';
  expect(
    run(
      imp +
        "const a = <Dynamic is={pages[name()]} title={t()}>{x()}</Dynamic>;",
    ),
  ).toBe(
    imp +
      "const a = <Dynamic is={() => (pages[name()])} title={t()}>{() => (x())}</Dynamic>;",
  );
});

test("property reads are reactive too (stores and props)", () => {
  expect(run("const a = <p class={styles.box}>{state.count}</p>;")).toBe(
    "const a = <p class={() => (styles.box)}>{() => (state.count)}</p>;",
  );
  expect(
    none("const a = <button onClick={handlers.click}>x</button>;"),
  ).toBeNull();
});

test("Show and For wrap a property read in when and each", () => {
  expect(run(SHOW + "const a = <Show when={state.open}><p>x</p></Show>;")).toBe(
    SHOW +
      "const a = <Show when={() => (state.open)}>{() => (<p>x</p>)}</Show>;",
  );
  expect(
    run(FOR + "const a = <For each={state.todos}>{(t) => <li>x</li>}</For>;"),
  ).toBe(
    FOR +
      "const a = <For each={() => (state.todos)}>{(t) => <li>x</li>}</For>;",
  );
});

test("a component's own props are still not wrapped", () => {
  expect(none("const a = <Counter start={state.count} />;")).toBeNull();
});
