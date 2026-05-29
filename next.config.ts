import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:3000";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    BACKEND_URL: backendOrigin,
  },
  async headers() {
    const panelSecurityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    const cspHeader = {
      key: "Content-Security-Policy",
      value:
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    };
    const withCsp = [...panelSecurityHeaders, cspHeader];
    return [
      { source: "/admin/:path*", headers: withCsp },
      { source: "/admin", headers: withCsp },
      { source: "/enterprise/:path*", headers: withCsp },
      { source: "/enterprise", headers: withCsp },
      { source: "/doctor/:path*", headers: withCsp },
      { source: "/doctor", headers: withCsp },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
