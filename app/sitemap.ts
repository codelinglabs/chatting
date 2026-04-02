import type { MetadataRoute } from "next";
import { getAllBlogAuthors, getAllBlogPosts } from "@/lib/blog-data";
import { buildAbsoluteUrl } from "@/lib/blog-utils";
import { freeToolCategories, getAllFreeTools } from "@/lib/free-tools-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: buildAbsoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: buildAbsoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.9 },
    { url: buildAbsoluteUrl("/free-tools"), changeFrequency: "weekly", priority: 0.9 },
    { url: buildAbsoluteUrl("/changelog"), changeFrequency: "weekly", priority: 0.7 },
    { url: buildAbsoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: buildAbsoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.3 }
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: buildAbsoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8
  }));

  const blogAuthorRoutes: MetadataRoute.Sitemap = getAllBlogAuthors().map((author) => ({
    url: buildAbsoluteUrl(`/blog/authors/${author.slug}`),
    changeFrequency: "monthly",
    priority: 0.6
  }));

  const freeToolCategoryRoutes: MetadataRoute.Sitemap = freeToolCategories.map((category) => ({
    url: buildAbsoluteUrl(`/free-tools/category/${category.slug}`),
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const freeToolRoutes: MetadataRoute.Sitemap = getAllFreeTools().map((tool) => ({
    url: buildAbsoluteUrl(tool.href),
    lastModified: tool.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8
  }));

  return [...staticRoutes, ...blogRoutes, ...blogAuthorRoutes, ...freeToolCategoryRoutes, ...freeToolRoutes];
}
