/** Auto-proxy to pranidoctor-backend — AI usage monthly cost */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
