# AI Administration Panel (Web)

Admin UI for the Prani Doctor AIMS stack. Canonical backend documentation: [`pranidoctor-backend/docs/ai/AI_ADMIN_PANEL.md`](../../pranidoctor-backend/docs/ai/AI_ADMIN_PANEL.md).

## Routes

| Page | Component |
|------|-----------|
| `/admin/ai-ops` | `AiOpsOverview` |
| `/admin/ai-ops/providers` | `ProviderPanel` |
| `/admin/ai-ops/models` | `ModelPanel` |
| `/admin/ai-ops/routes` | `RoutePanel` |
| `/admin/ai-ops/api-keys` | `ApiKeysPanel` |
| `/admin/ai-ops/prompts` | `PromptList` |
| `/admin/ai-ops/analytics` | `UsageAnalyticsPanel` |
| `/admin/ai-ops/failover` | `FailoverPanel` |
| `/admin/ai-ops/health` | `HealthPanel` |

## Data fetching

All panels use `useAiAdminResource` → `adminFetch` → BFF `proxyRouteToBackend` → backend `/api/admin/ai-ops/*`.

## Permissions

Capability keys in `src/lib/admin-auth/permissions-core.ts`. Nav filtering via `filterAdminNavGroupsForActor`.

## Validation

Form schemas: `src/lib/admin-ai/schemas.ts` (client-side; backend validates independently).
