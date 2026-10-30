import { TodoDemo } from "../demos";
import { Code, Demo } from "../ui";

export function Stores() {
  return (
    <article>
      <h1>Stores</h1>
      <p>
        A store holds nested objects and arrays. Reads are tracked per property,
        so something that reads <code>state.user.name</code> does not update
        when <code>state.user.age</code> changes.
      </p>
      <Code
        code={`const [state, setState] = createStore({
  user: { name: "Ada", age: 30 },
  todos: [{ id: 1, text: "Learn Cajoa", done: false }],
});

<p>{state.user.name}</p>
<For each={state.todos}>{(todo) => <li>{todo.text}</li>}</For>

setState("user", "name", "Grace");                 // a path, then a value
setState("todos", 0, "done", true);                // arrays work with indexes
setState("user", { age: 31 });                     // an object is merged
setState("todos", (list) => [...list, newTodo]);   // a function gets the previous value and replaces it
setState((draft) => {                              // or edit a draft
  draft.user.name = "Linus";
  draft.todos.push(newTodo);
});`}
      />
      <Demo>
        <TodoDemo />
      </Demo>
      <ul>
        <li>
          <code>state</code> is read-only. Changing it directly (
          <code>state.count = 1</code>) throws, so you never lose reactivity by
          accident.
        </li>
        <li>
          An object is <strong>merged</strong> (shallow) into the existing one.
          A function <strong>replaces</strong> the value with what it returns.
          Setting a key to <code>undefined</code> removes it from an object.
        </li>
        <li>
          Only plain objects and arrays are reactive. A <code>Date</code>, a{" "}
          <code>Map</code> or a class instance is a value you replace as a
          whole.
        </li>
        <li>
          The store takes ownership of the object you pass in. Items keep their
          identity, so <code>{"<For>"}</code> reuses their DOM nodes.
        </li>
        <li>
          One <code>setState</code> call is one update.{" "}
          <code>unwrap(state)</code> gives the plain object behind the store. Do
          not change it.
        </li>
      </ul>
    </article>
  );
}
