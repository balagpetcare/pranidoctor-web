/** Auto-proxy to pranidoctor-backend — set primary API key */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const PUT = (request: Request) => proxyRouteToBackend(request);
