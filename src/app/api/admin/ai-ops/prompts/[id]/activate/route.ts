/** Auto-proxy to pranidoctor-backend — activate AI prompt */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
