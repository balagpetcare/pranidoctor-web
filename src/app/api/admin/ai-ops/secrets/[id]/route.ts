/** Auto-proxy to pranidoctor-backend — AI vault secret by id */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
export const PUT = (request: Request) => proxyRouteToBackend(request);
