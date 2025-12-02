import type { NextConfig } from "next";

const socketInternalOrigin = (process.env.SOCKET_INTERNAL_URL || "http://localhost:3006").replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/socket/:path*",
        destination: `${socketInternalOrigin}/api/socket/:path*`,
      },
    ];
  },
};

export default nextConfig;
