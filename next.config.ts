import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  typedRoutes: true,
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime !== "nodejs") {
      config.resolve ??= {};
      config.resolve.alias ??= {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        net: false,
        tls: false
      };
      config.resolve.alias["pg-native"] = false;
      config.plugins ??= [];
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:(crypto|fs|net|tls)$/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
    }

    return config;
  }
};

export default nextConfig;
