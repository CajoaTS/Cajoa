import { createSignal } from "cajoa";

export function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <button onClick={() => setCount((c) => c + 1)}>
        Clicked {count()} times
      </button>
      <p>Double: {count() * 2}</p>
    </div>
  );
}
