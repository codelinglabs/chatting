import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  typedRoutes: true,
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
