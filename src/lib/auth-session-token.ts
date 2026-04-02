import { createHash } from "node:crypto";
import { getAuthSecret } from "@/lib/env.server";

export function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(`${getAuthSecret()}:${token}`)
    .digest("hex");
}
