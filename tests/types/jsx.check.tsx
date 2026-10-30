import { createSignal, For, Show } from "cajoa";

const [count] = createSignal(0);

export const valid = (
  <div
    class="a"
    id={() => `c-${count()}`}
    style={{
      color: "red",
      "font-size": "12px",
      backgroundColor: count() > 1 && "blue",
      "--gap": "4px",
    }}
    data-testid="t"
    aria-label="x"
    aria-hidden="false"
    tabIndex={0}
    onClick={(e) => e.currentTarget.classList.add("x")}
  >
    <input
      type="text"
      value={count()}
      disabled
      maxLength={10}
      onInput={(e) => {
        const text: string = e.currentTarget.value;
        return text;
      }}
      ref={(el) => el.focus()}
    />
    <button type="submit" onClick={(e) => e.clientX}>
      go
    </button>
    <a href="/x" target="_blank" onClick={cond() ? undefined : false}>
      link
    </a>
    <label htmlFor="a">name</label>
    <select value="b" onChange={(e) => e.currentTarget.value}>
      <option value="a">A</option>
    </select>
    <form onSubmit={(e) => e.preventDefault()} />
    <svg viewBox="0 0 10 10">
      <circle cx="5" cy="5" r={4} strokeWidth="2" fill={() => "red"} />
      <feGaussianBlur stdDeviation="2" />
    </svg>
    <my-widget anything="goes" onClick={() => {}} />
    <Show when={count()}>
      <p>{count()}</p>
    </Show>
    <For each={[1, 2]}>{(n: number) => <li>{n}</li>}</For>
  </div>
);

function cond() {
  return true;
}
export const Box = (props: { children?: unknown }) => (
  <div>{props.children}</div>
);


// @ts-expect-error unknown element
export const e1 = <divv />;

// @ts-expect-error unknown attribute
export const e2 = <div clas="x" />;

// @ts-expect-error disabled is a boolean
export const e3 = <input disabled="yes" />;

// @ts-expect-error onClick gets a MouseEvent, which has no key
export const e4 = <button onClick={(e) => e.key} />;

// @ts-expect-error a div has no value
export const e5 = <div onClick={(e) => e.currentTarget.value} />;

// @ts-expect-error ARIA booleans are strings
export const e6 = <div aria-hidden={true} />;

// @ts-expect-error style values are strings
export const e7 = <div style={{ width: 100 }} />;

// @ts-expect-error ref must match the element
export const e8 = <div ref={(el: HTMLInputElement) => el} />;

// @ts-expect-error not a valid input type
export const e9 = <input type="textt" />;

// @ts-expect-error a circle has no d
export const e10 = <circle d="M0 0" />;

// @ts-expect-error draggable is a string
export const e11 = <div draggable={true} />;
