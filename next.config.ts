import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  typedRoutes: true,
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
