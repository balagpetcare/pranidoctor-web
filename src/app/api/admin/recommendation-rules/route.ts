/** Auto-proxy to pranidoctor-backend — recommendation rules. */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
export const PUT = (request: Request) => proxyRouteToBackend(request);
