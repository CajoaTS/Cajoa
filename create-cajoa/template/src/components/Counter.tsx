import { createSignal } from "cajoa";

export function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div class="demo-card">
      <div class="demo-head">
        <span class="demo-label">Live demo</span>
        <span class="demo-hint">Every number below is a signal.</span>
      </div>

      <div class="demo-value" aria-live="polite">
        {count()}
      </div>

      <div class="meter" aria-hidden="true">
        <div
          class="meter-fill"
          style={{ width: `${Math.min(count(), 10) * 10}%` }}
        />
      </div>

      <p class="demo-meta">
        double: <strong>{count() * 2}</strong> ·{" "}
        {count() % 2 === 0 ? "even" : "odd"}
      </p>

      <div class="demo-actions">
        <button
          class="btn btn-ghost"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
        >
          −
        </button>
        <button class="btn btn-primary" onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
        <button class="btn btn-ghost" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}
