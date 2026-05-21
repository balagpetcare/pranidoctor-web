import type { NextConfig } from "next";

const backendOrigin =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:3000";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: backendOrigin,
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
