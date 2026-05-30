/** Auto-proxy — publish prompt version */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const POST = (request: Request) => proxyRouteToBackend(request);
