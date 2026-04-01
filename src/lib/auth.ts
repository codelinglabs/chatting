import { randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_REQUEST_PATH_HEADER, AUTH_SESSION_COOKIE_NAME, buildLoginPath } from "@/lib/auth-redirect";
import { isProductionRuntime } from "@/lib/env";
import { deleteAuthSessionByTokenHash, findCurrentUserByTokenHash, insertAuthSession } from "@/lib/repositories/auth-repository";
import { getWorkspaceAccess } from "@/lib/workspace-access";
import { hashSessionToken, mapUser } from "./auth-credentials";

export {
  changeUserPassword,
  signInUser,
  signUpInvitedUser,
  signUpUser
} from "./auth-credentials";
export { resumeOwnerOnboardingForUser } from "./auth-owner-onboarding";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function setUserSession(userId: string) {
  const sessionId = randomBytes(16).toString("hex");
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();

  await insertAuthSession({
    sessionId,
    userId,
    tokenHash: hashSessionToken(token)
  });

  cookieStore.set(AUTH_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionRuntime(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (token) {
    await deleteAuthSessionByTokenHash(hashSessionToken(token));
  }

  cookieStore.delete(AUTH_SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(AUTH_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const row = await findCurrentUserByTokenHash(hashSessionToken(token));
  if (!row) {
    return null;
  }

  const user = mapUser(row);
  const workspace = await getWorkspaceAccess(user.id);
  return {
    ...user,
    workspaceOwnerId: workspace.ownerUserId,
    workspaceRole: workspace.role
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginPath((await headers()).get(AUTH_REQUEST_PATH_HEADER)));
  }

  return user;
}
