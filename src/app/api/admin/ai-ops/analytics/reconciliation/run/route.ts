/** Auto-proxy to pranidoctor-backend — AI analytics reconciliation manual run */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
