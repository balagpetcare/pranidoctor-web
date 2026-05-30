/** Auto-proxy to pranidoctor-backend — rotate AI vault secret */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
