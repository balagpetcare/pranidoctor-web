import { proxyRouteToBackend } from "@/lib/proxy-to-backend";

export const GET = (request: Request) => proxyRouteToBackend(request);
