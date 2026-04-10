import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { withRouteErrorAlerting } from "@/lib/route-error-alerting";
import { renderOgTemplate } from "./og-template";

export const runtime = "nodejs";

const IMAGE_SIZE = {
  width: 1200,
  height: 630
} as const;

const CACHE_HEADERS = {
  "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
};

type TemplateName = "a" | "b" | "c" | "d" | "default";

function readParam(searchParams: URLSearchParams, key: string, fallback: string, maxLength: number) {
  const value = searchParams.get(key)?.trim();
  return value ? value.slice(0, maxLength) : fallback;
}

async function handleGET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const template = readParam(searchParams, "template", "default", 12) as TemplateName;
    const title = readParam(searchParams, "title", "Live chat for small teams.", 120);
    const subtitle = readParam(searchParams, "subtitle", "See who's on your site. Answer their questions. Close the deal.", 160);
    const category = readParam(searchParams, "category", "LIVE CHAT", 40);
    const competitor = readParam(searchParams, "competitor", "INTERCOM", 40);

    return new ImageResponse(renderOgTemplate(template, title, subtitle, category, competitor), {
      ...IMAGE_SIZE,
      headers: CACHE_HEADERS
    });
  } catch (error) {
    console.error("Failed to generate OG image", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}

export const GET = withRouteErrorAlerting(handleGET, "app/api/og/route.ts:GET");
