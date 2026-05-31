/** Auto-proxy to pranidoctor-backend — disable provider */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
