/** Auto-proxy to pranidoctor-backend — feed nutrition admin list. */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
