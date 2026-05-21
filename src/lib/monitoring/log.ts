/**
 * Monitoring fallback logger — Edge-safe JSON lines via console.
 * Node request handlers should prefer `serverLog` (stdout/stderr) for correlation context.
 */
export { edgeLog as monitoringLog } from "@/lib/logging/edge-logger";
