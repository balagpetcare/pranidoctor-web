/** Auto-proxy to pranidoctor-backend — AI provider summary */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
