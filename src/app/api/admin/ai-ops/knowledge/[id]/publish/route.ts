/** Auto-proxy to pranidoctor-backend — publish knowledge entry */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
