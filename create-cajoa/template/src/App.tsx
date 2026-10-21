import { For } from "cajoa";
import { Counter } from "./components/Counter";
import { CopyCommand } from "./components/CopyCommand";
import { Logo } from "./components/Logo";
import { ThemeToggle } from "./components/ThemeToggle";

interface Feature {
  title: string;
  text: string;
}

const features: Feature[] = [
  {
    title: "Signals, not re-renders",
    text: "Components run once. Only the exact text or attribute that depends on a signal updates.",
  },
  {
    title: "Plain JSX",
    text: "Write calls like count() * 2 right in your markup. The Vite plugin makes them reactive.",
  },
  {
    title: "Tiny and readable",
    text: "No virtual DOM and no hooks rules. The whole core is small enough to read in one sitting.",
  },
  {
    title: "Renderer-agnostic",
    text: "The core knows nothing about the DOM, so other platforms can plug in their own renderer.",
  },
];

// This page is just a starting point. Replace it with your own app.
export function App() {
  return (
    <div class="page">
      <header class="container nav">
        <a class="brand" href="/" aria-label="Cajoa home">
          <Logo />
          <span>Cajoa</span>
        </a>
        <nav class="nav-links" aria-label="Main">
          <a
            href="https://github.com/CajoaTS/Cajoa"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/cajoa"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <ThemeToggle />
        </nav>
      </header>

      <main class="container">
        <section class="hero">
          <span class="badge">Signals · JSX · Vite</span>
          <h1>
            Build interfaces with <span class="gradient-text">signals</span>,
            not re-renders.
          </h1>
          <p class="lead">
            Cajoa is a small, beginner-friendly framework. Components run once,
            and only what changed updates.
          </p>
          <div class="actions">
            <a class="btn btn-primary" href="#start">
              Get started
            </a>
            <a
              class="btn btn-ghost"
              href="https://github.com/CajoaTS/Cajoa"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </section>

        <section id="demo" aria-label="Live demo">
          <Counter />
        </section>

        <section class="features" aria-label="Features">
          <For each={features}>
            {(feature: Feature, i: number) => {
              const num = String(i + 1).padStart(2, "0");
              return (
                <article class="feature">
                  <span class="feature-num">{num}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              );
            }}
          </For>
        </section>

        <section id="start" class="start">
          <h2>Get started</h2>
          <ol class="steps">
            <li>
              <p>
                <strong>Make it yours.</strong> Edit <code>src/App.tsx</code>{" "}
                and save. Changes appear instantly.
              </p>
            </li>
            <li>
              <p>
                <strong>Play with signals.</strong> Open{" "}
                <code>src/components/Counter.tsx</code> and change what it does.
              </p>
            </li>
            <li>
              <p>
                <strong>Ship it.</strong> Build your app for production:
              </p>
              <CopyCommand command="npm run build" />
            </li>
          </ol>
        </section>
      </main>

      <footer class="container footer">
        Built with{" "}
        <a
          href="https://github.com/CajoaTS/Cajoa"
          target="_blank"
          rel="noreferrer"
        >
          Cajoa
        </a>
        . Replace this page with your own.
      </footer>
    </div>
  );
}
