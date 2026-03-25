import { clearUserSession } from "@/lib/auth";
import { redirect303 } from "@/lib/route-helpers";

export async function POST(request: Request) {
  await clearUserSession();

  return redirect303(request, "/");
}
