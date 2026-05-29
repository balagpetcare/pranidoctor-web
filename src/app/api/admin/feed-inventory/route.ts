/** Auto-proxy to pranidoctor-backend — platform feed inventory monitor. */
import { proxyRouteToBackend } from '@/lib/proxy-to-backend';

export const GET = (request: Request) => proxyRouteToBackend(request);
