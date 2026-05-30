/** Auto-proxy to pranidoctor-backend — AI vault secrets */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
export const POST = (request: Request) => proxyRouteToBackend(request);
