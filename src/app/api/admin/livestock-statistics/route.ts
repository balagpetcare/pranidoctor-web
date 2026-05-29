/** Auto-proxy to pranidoctor-backend — platform livestock statistics. */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
