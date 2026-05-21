# Edge runtime logging fix

## Problem

Next.js **Edge Instrumentation** statically analyzed `src/instrumentation.ts` and pulled in Node-only APIs:

| Module | Node API |
|--------|----------|
| `lib/logging/server-logger.ts` | `process.stdout` / `process.stderr` |
| `lib/env/production-validation.ts` | `process.stdout` / `process.stderr` (boot logs) |

Import chain at build/dev time:

```
instrumentation.ts
  → monitoring/alerts.ts → server-logger.ts
  → env/production-validation.ts
```

Runtime guards (`if (NEXT_RUNTIME === "edge") return`) did not help — **static imports** still bundled forbidden APIs into the Edge graph.

## Solution

### 1. Edge-safe structured logger

- `lib/logging/structured-log-core.ts` — shared JSON entry builder, levels, redaction
- `lib/logging/log-sink.ts` — `node` (stdout/stderr) vs `edge` (`console.log` / `console.error`)
- `lib/logging/edge-logger.ts` — Edge-safe `edgeLog` (no `server-only`, no `process.stdout`)

### 2. Node-only server logger (unchanged API)

- `lib/logging/server-logger.ts` — still `import "server-only"`, uses **node** sink + `AsyncLocalStorage` request context
- API routes and proxies keep `serverLog` with stdout JSON lines

### 3. Monitoring abstraction

- `lib/monitoring/log.ts` — exports `monitoringLog` (= `edgeLog`)
- `lib/monitoring/alerts.ts` — uses `monitoringLog` for webhook fallback / no-webhook alerts (Edge-safe)

`error-tracking.ts` remains Node-only (`server-only` + `serverLog`); only loaded from Node contexts.

### 4. Instrumentation isolation

`instrumentation.ts` has **no static imports** of Node-only modules. Node work runs via dynamic `import()` inside `register()` and `onRequestError()` after `NEXT_RUNTIME !== "edge"`:

- `production-validation` (boot assert)
- `error-tracking`
- `alerts`
- `correlation`

### 5. Production validation boot logs

`writeBootLog` in `production-validation.ts` uses `edgeLog` (console JSON) instead of `process.stdout`/`stderr`, so the validation module is safe if ever analyzed for Edge. Validation rules and `assertProductionEnvOrThrow` behavior are unchanged.

## Files touched

| File | Change |
|------|--------|
| `src/instrumentation.ts` | Dynamic imports only |
| `src/lib/logging/structured-log-core.ts` | New shared core |
| `src/lib/logging/log-sink.ts` | New sinks |
| `src/lib/logging/edge-logger.ts` | New Edge logger |
| `src/lib/logging/server-logger.ts` | Uses core + node sink |
| `src/lib/monitoring/log.ts` | Monitoring logger export |
| `src/lib/monitoring/alerts.ts` | `monitoringLog` instead of `serverLog` |
| `src/lib/env/production-validation.ts` | `edgeLog` for boot messages |

## Validation

```bash
npm run build          # no Edge Runtime stdout/stderr warnings
npm run test           # server-logger + edge-logger tests
```

Manual:

1. `npm run dev` → open `/admin/login` — no Edge instrumentation warnings in terminal
2. Trigger admin API log path — stdout JSON still emitted from `serverLog` in Node routes

## Design notes

- Instrumentation stays enabled; app middleware/routes remain on their configured runtimes.
- Structured log **shape** is identical across sinks; only the transport differs (stdout vs console).
- Do not import `server-logger` from modules that must load in Edge or instrumentation graphs.
