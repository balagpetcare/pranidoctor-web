/** Auto-proxy to pranidoctor-backend — closed beta dashboard metrics */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
