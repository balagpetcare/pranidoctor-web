/** Auto-proxy to pranidoctor-backend — do not add Prisma here. */
import { proxyRouteToBackend } from "@/lib/proxy-to-backend";

export const GET = (request: Request) => proxyRouteToBackend(request);
export const PATCH = (request: Request) => proxyRouteToBackend(request);
export const DELETE = (request: Request) => proxyRouteToBackend(request);
