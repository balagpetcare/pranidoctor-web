/** Auto-proxy to pranidoctor-backend — AI operations dashboard */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
