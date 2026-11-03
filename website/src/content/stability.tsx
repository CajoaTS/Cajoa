import { Callout } from "../ui";

export function Stability() {
  return (
    <article>
      <h1>Stability and versioning</h1>
      <p>
        From version 1.0, Cajoa follows{" "}
        <a href="https://semver.org/">semantic versioning</a>. In simple words:
      </p>
      <ul>
        <li>
          A <strong>patch</strong> release (1.0.1) only fixes bugs.
        </li>
        <li>
          A <strong>minor</strong> release (1.1.0) adds things. Your code keeps
          working.
        </li>
        <li>
          A <strong>major</strong> release (2.0.0) may break things. It comes
          with a migration guide.
        </li>
      </ul>
      <p>
        The packages <code>cajoa</code>, <code>@cajoa/core</code>,{" "}
        <code>@cajoa/dom</code> and <code>@cajoa/server</code> always share one
        version number.
      </p>

      <h2>What is stable</h2>
      <p>
        Everything in these docs: the functions and components, their arguments,
        and the behavior described. The public types of every package are saved
        in the <code>api</code> folder of the repository, and a change to them
        cannot be merged by accident.
      </p>

      <h2>What is experimental</h2>
      <p>
        These parts can change in a minor release. Use them if you need them,
        but pin the version.
      </p>
      <ul>
        <li>
          The <code>Renderer</code> interface and <code>setRenderer</code>,{" "}
          <code>getRenderer</code> and <code>currentRenderer</code> (for
          building other renderers)
        </li>
        <li>
          <code>ServerContext</code> and <code>ServerRequest</code>
        </li>
        <li>
          The <code>hydratable</code> option of the server renderer, and the
          markers it writes. There is no <code>hydrate()</code> yet.
        </li>
        <li>Debug hooks, when they arrive</li>
      </ul>

      <h2>Supported versions</h2>
      <ul>
        <li>
          <strong>Node.js:</strong> 20 or newer
        </li>
        <li>
          <strong>TypeScript:</strong> 5 or newer (for the typed JSX)
        </li>
        <li>
          <strong>Vite:</strong> 8 (for the plugin)
        </li>
        <li>
          <strong>Browsers:</strong> current versions of Chrome, Edge, Firefox
          and Safari (the code is built for ES2022)
        </li>
      </ul>
      <Callout title="Keeping up with Vite">
        A weekly job builds and tests Cajoa with the newest Vite. When it
        passes, the supported range is widened in a minor release.
      </Callout>

      <h2>Deprecations</h2>
      <p>
        Something is first deprecated, with a warning in dev mode, for at least
        one minor release. It is removed only in a major release.
      </p>

      <h2>Security</h2>
      <p>
        The latest release gets security fixes. Please report a problem
        privately, using the{" "}
        <a href="https://github.com/CajoaTS/Cajoa/security/policy">
          security policy
        </a>
        .
      </p>
    </article>
  );
}
