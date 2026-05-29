/** Auto-proxy to pranidoctor-backend — vendor detail/update. */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
export const PATCH = (request: Request) => proxyRouteToBackend(request);
