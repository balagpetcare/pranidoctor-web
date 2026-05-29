/** Auto-proxy to pranidoctor-backend — platform feed analytics. */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
