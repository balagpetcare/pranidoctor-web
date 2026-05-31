/** Auto-proxy to pranidoctor-backend — AI analytics reconciliation status */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
