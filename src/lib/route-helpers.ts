import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import type { CurrentUser } from "@/lib/types";

type RouteUserResult =
  | {
      user: CurrentUser;
    }
  | {
      response: NextResponse;
    };

export function redirect303(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), {
    status: 303
  });
}

export function dashboardRedirect(
  request: Request,
  options: {
    conversationId?: string | null;
    error?: string;
    success?: string;
  } = {}
) {
  const params = new URLSearchParams();

  if (options.conversationId) {
    params.set("id", options.conversationId);
  }

  if (options.error) {
    params.set("error", options.error);
  }

  if (options.success) {
    params.set("success", options.success);
  }

  const search = params.toString();
  return redirect303(request, search ? `/dashboard?${search}` : "/dashboard");
}

export async function requireRouteUser(request: Request): Promise<RouteUserResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      response: redirect303(request, "/login")
    };
  }

  return { user };
}

