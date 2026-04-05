import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth-redirect";
import { hashSessionToken } from "@/lib/auth-session-token";
import {
  findAuthSessionWorkspaceOwnerByTokenHash,
  updateAuthSessionActiveWorkspaceByTokenHash
} from "@/lib/repositories/auth-repository";

async function getCurrentSessionTokenHash() {
  try {
    const token = (await cookies()).get(AUTH_SESSION_COOKIE_NAME)?.value;
    return token ? hashSessionToken(token) : null;
  } catch {
    return null;
  }
}

export async function getCurrentSessionActiveWorkspaceOwnerId() {
  const tokenHash = await getCurrentSessionTokenHash();
  if (!tokenHash) {
    return null;
  }

  return findAuthSessionWorkspaceOwnerByTokenHash(tokenHash);
}

export async function setCurrentSessionActiveWorkspaceOwnerId(ownerUserId: string | null) {
  const tokenHash = await getCurrentSessionTokenHash();
  if (!tokenHash) {
    return;
  }

  await updateAuthSessionActiveWorkspaceByTokenHash(tokenHash, ownerUserId);
}
