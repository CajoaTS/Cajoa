# Contributing

## Setup

```bash
npm install
npm run verify   # typecheck, tests, build, sync checks, package checks
npm run dev      # playground
```

Browser tests (Playwright) run against a small app in `e2e/app`:

```bash
npm run e2e:install   # one time: download the browsers
npm run test:e2e
```

They run in CI as the `e2e` check. When you fix a browser-specific bug, add a test in `e2e/tests`.

## Benchmarks and size budget

```bash
npm run bench           # reactivity micro-benchmarks in Node (also checks the update counts)
npm run bench:browser   # row benchmarks in real Chromium, a bit noisy, run it locally
npm run check:size      # gzip size of small apps vs size-budget.json (part of `npm run verify`)
```

If a change makes a bundle bigger than its budget, `verify` fails. If the growth is on purpose, run `npm run size:update` and commit `size-budget.json`, and say why in the PR.

## Making a change

1. Branch from `main` and open a pull request. Do not push to `main` directly.
2. Add tests for your change.
3. Run `npm run changeset` and describe the change. Use `minor` while we are on 0.x,
   even for breaking changes. `cajoa`, `@cajoa/core` and `@cajoa/dom` always share one version.
4. If the change affects what new projects get, add a changeset for `create-cajoa` too.
5. CI runs `npm run verify` on Node 20, 22 and 24.

## Releasing

Releases are automated. Do not run `npm publish` by hand.

1. Merge PRs that include changesets into `main`.
2. The Release workflow opens a "chore: version packages" PR. It bumps versions,
   updates changelogs, and syncs the README and the starter template.
3. If CI is waiting for approval on that PR, click "Approve and run".
4. Merge it. The workflow publishes to npm with provenance.

## Layout

- `packages/core` (`@cajoa/core`): renderer-agnostic core
- `packages/dom` (`@cajoa/dom`): DOM renderer and router
- `packages/cajoa` (`cajoa`): umbrella package most people install
- `create-cajoa`: starter (`npm create cajoa@latest`)
- The root `README.md` and `LICENSE` are copied into packages by `npm run sync`.
- The starter template's `cajoa` version is set by `npm run sync:create`.
