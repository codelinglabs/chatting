import { NextResponse } from "next/server";

export function publicCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export function publicNoContentResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: publicCorsHeaders()
  });
}

export function publicJsonResponse(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...publicCorsHeaders(),
      ...(init?.headers ?? {})
    }
  });
}
