/** Auto-proxy to pranidoctor-backend — provider priority batch update */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const PUT = (request: Request) => proxyRouteToBackend(request);
