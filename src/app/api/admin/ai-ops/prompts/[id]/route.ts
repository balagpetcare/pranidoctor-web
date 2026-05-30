/** Auto-proxy — get prompt by id */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
export const PUT = (request: Request) => proxyRouteToBackend(request);
export const DELETE = (request: Request) => proxyRouteToBackend(request);
