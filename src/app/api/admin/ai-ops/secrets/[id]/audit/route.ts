/** Auto-proxy to pranidoctor-backend — AI vault secret audit log */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
