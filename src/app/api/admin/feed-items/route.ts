/** Auto-proxy to pranidoctor-backend — Phase 4 feed items admin API. */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
export const POST = (request: Request) => proxyRouteToBackend(request);
