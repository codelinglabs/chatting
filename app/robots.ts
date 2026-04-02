import type { MetadataRoute } from "next";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { getSiteBaseUrl } from "@/lib/site-seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/conversation/",
          "/dashboard/",
          "/invite",
          "/login",
          "/onboarding",
          "/signup",
          "/verify"
        ]
      }
    ],
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
    host: getSiteBaseUrl()
  };
}
