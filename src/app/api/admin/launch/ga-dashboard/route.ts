/** Auto-proxy to pranidoctor-backend — GA dashboard metrics */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
