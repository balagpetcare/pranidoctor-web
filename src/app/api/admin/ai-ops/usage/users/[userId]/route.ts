/** Auto-proxy to pranidoctor-backend — AI ops user token usage */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
