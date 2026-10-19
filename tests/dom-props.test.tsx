import { test, expect, vi } from "vitest";
import { createSignal, domRenderer } from "cajoa";

test("style accepts an object (camelCase, kebab-case and custom properties)", () => {
  const box = (
    <div
      style={{
        color: "red",
        backgroundColor: "blue",
        "font-size": "20px",
        "--accent": "gold",
      }}
    />
  ) as HTMLElement;

  expect(box.style.color).toBe("red");
  expect(box.style.backgroundColor).toBe("blue");
  expect(box.style.fontSize).toBe("20px");
  expect(box.style.getPropertyValue("--accent")).toBe("gold");
});

test("reactive style removes properties that are no longer set", () => {
  const [big, setBig] = createSignal(true);
  const box = (
    <div
      style={() =>
        big() ? { color: "red", fontSize: "20px" } : { color: "blue" }
      }
    />
  ) as HTMLElement;

  expect(box.style.fontSize).toBe("20px");

  setBig(false);
  expect(box.style.color).toBe("blue");
  expect(box.style.fontSize).toBe("");
});

test("style accepts a string", () => {
  const box = (<div style="color: green" />) as HTMLElement;
  expect(box.style.color).toBe("green");
});

test("input value is a live property, not just an attribute", () => {
  const [text, setText] = createSignal("a");
  const input = (<input value={text} />) as HTMLInputElement;
  expect(input.value).toBe("a");

  input.value = "typed by the user";
  setText("b");
  expect(input.value).toBe("b");
});

test("onInput can drive a controlled input", () => {
  const [text, setText] = createSignal("");
  const input = (
    <input
      value={text}
      onInput={(e: Event) => setText((e.target as HTMLInputElement).value)}
    />
  ) as HTMLInputElement;

  input.value = "hello";
  input.dispatchEvent(new Event("input", { bubbles: true }));

  expect(text()).toBe("hello");
  expect(input.value).toBe("hello");
});

test("checked follows the signal even after the user clicked the checkbox", () => {
  const [on, setOn] = createSignal(false);
  const box = (<input type="checkbox" checked={on} />) as HTMLInputElement;
  expect(box.checked).toBe(false);

  box.click(); // ang user ang nag-check, hindi pa nagbabago ang signal
  expect(box.checked).toBe(true);

  setOn(true);
  setOn(false);
  expect(box.checked).toBe(false);
});

test("select value works with a reactive value", () => {
  const [color, setColor] = createSignal("b");
  const select = (
    <select value={color}>
      <option value="a">A</option>
      <option value="b">B</option>
      <option value="c">C</option>
    </select>
  ) as HTMLSelectElement;

  expect(select.value).toBe("b");

  setColor("c");
  expect(select.value).toBe("c");
});

test("select value works with a static value", () => {
  const select = (
    <select value="b">
      <option value="a">A</option>
      <option value="b">B</option>
    </select>
  ) as HTMLSelectElement;

  expect(select.value).toBe("b");
});

test("onDoubleClick listens to dblclick", () => {
  const handler = vi.fn();
  const btn = (<button onDoubleClick={handler}>x</button>) as HTMLButtonElement;

  btn.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  expect(handler).toHaveBeenCalledTimes(1);
});

test("setting an event prop again replaces or removes the old listener", () => {
  const first = vi.fn();
  const second = vi.fn();
  const btn = document.createElement("button");

  domRenderer.setProp(btn, "onClick", first);
  domRenderer.setProp(btn, "onClick", second);
  btn.click();
  expect(first).not.toHaveBeenCalled();
  expect(second).toHaveBeenCalledTimes(1);

  domRenderer.setProp(btn, "onClick", null);
  btn.click();
  expect(second).toHaveBeenCalledTimes(1);
});

test("inline string handlers are ignored", () => {
  const btn = (<button onclick="alert(1)">x</button>) as HTMLButtonElement;
  expect(btn.getAttribute("onclick")).toBeNull();
});

test("boolean attributes are reactive and htmlFor becomes for", () => {
  const [off, setOff] = createSignal(true);
  const btn = (<button disabled={off}>x</button>) as HTMLButtonElement;
  expect(btn.disabled).toBe(true);

  setOff(false);
  expect(btn.disabled).toBe(false);

  const label = (<label htmlFor="name">Name</label>) as HTMLLabelElement;
  expect(label.getAttribute("for")).toBe("name");
});
