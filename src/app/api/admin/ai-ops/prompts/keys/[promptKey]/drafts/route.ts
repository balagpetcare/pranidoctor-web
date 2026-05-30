/** Auto-proxy — create draft from published prompt */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
