/** Auto-proxy — list prompt versions by key */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
