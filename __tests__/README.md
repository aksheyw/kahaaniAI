# Tests

Regression tests for `/api/health` and `/api/generate` serverless functions.

## Run

```bash
npm install      # first time only
npm test         # one-shot run
npm run test:watch   # watch mode for local dev
```

## Pattern

This test suite follows the **AI regression testing** pattern: write tests for bugs that were found, not for code that works. The current tests are baseline contract assertions — they verify the response shape and early-return paths so regressions in those areas fail loudly.

When a bug is found:

1. Write a failing test that reproduces it (named after the bug, e.g. `BUG-R1`)
2. Fix the code until the test passes
3. The test stays as a regression guard — that exact bug cannot return

## Structure

```
__tests__/
├── setup.js           # env vars: API key placeholder, NODE_ENV
├── helpers.js         # createReq / createRes / callHandler mocks (Vercel-style)
└── api/
    ├── health.test.js   # response shape, CORS, degraded-mode contract
    └── generate.test.js # method handling, validation, config errors
```

## What's NOT tested (and why)

- **Live LLM calls** — would be slow, flaky, and expensive. The two-agent pipeline (research → writer) is mocked at the `fetch` boundary.
- **RSS feed live fetches** — same reason; tests stub `fetch` for both Google News and Trends.
- **UI components** — this scaffold focuses on API regressions, where AI-introduced bugs cluster (sandbox/prod mismatch, response-shape drift).

## Adding a test

1. Identify the bug or contract you want to lock in.
2. Add a `.test.js` file under `__tests__/` mirroring the source path.
3. Use `callHandler(handler, { method, body })` from `helpers.js` to invoke any serverless function.
4. Assert on response shape, status code, and headers — NOT implementation internals.
