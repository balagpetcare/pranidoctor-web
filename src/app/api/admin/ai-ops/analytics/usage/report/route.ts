/** Auto-proxy to pranidoctor-backend — AI usage report (JSON or CSV) */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
