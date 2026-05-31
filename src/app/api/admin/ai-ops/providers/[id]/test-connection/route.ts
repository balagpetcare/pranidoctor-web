/** Auto-proxy to pranidoctor-backend — test provider connection */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
