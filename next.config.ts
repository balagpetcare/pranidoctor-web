import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:3000";

const nextConfig: NextConfig = {
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
    return [
      { source: "/admin/:path*", headers: panelSecurityHeaders },
      { source: "/admin", headers: panelSecurityHeaders },
      { source: "/enterprise/:path*", headers: panelSecurityHeaders },
      { source: "/enterprise", headers: panelSecurityHeaders },
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
