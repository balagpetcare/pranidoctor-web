/** Auto-proxy to pranidoctor-backend — provider status board */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
