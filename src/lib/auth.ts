import { createHash, randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSiteForUser } from "@/lib/data";
import { query } from "@/lib/db";
import type { CurrentUser } from "@/lib/types";

const AUTH_COOKIE_NAME = "chatly_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const scrypt = promisify(nodeScrypt);

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET?.trim() || (process.env.NODE_ENV === "production" ? "" : "chatly-dev-secret");
}

function requireAuthSecret() {
  const secret = getAuthSecret();

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(`${requireAuthSecret()}:${token}`)
    .digest("hex");
}

function mapUser(row: Pick<UserRow, "id" | "email" | "created_at">): CurrentUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at
  };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(`${requireAuthSecret()}:${password}`, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

async function verifyPasswordHash(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derived = (await scrypt(`${requireAuthSecret()}:${password}`, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

function defaultSiteNameForEmail(email: string) {
  const domain = normalizeEmail(email).split("@")[1];
  if (!domain) {
    return "My site";
  }

  const label = domain.split(".")[0];
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} site`;
}

export async function signUpUser(input: {
  email: string;
  password: string;
  siteName?: string;
}) {
  const email = normalizeEmail(input.email);
  const password = input.password.trim();
  const siteName = input.siteName?.trim() || defaultSiteNameForEmail(email);

  if (!email) {
    throw new Error("MISSING_EMAIL");
  }

  if (!password) {
    throw new Error("MISSING_PASSWORD");
  }

  if (password.length < 8) {
    throw new Error("WEAK_PASSWORD");
  }

  const existing = await query<{ id: string }>(
    `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  if (existing.rowCount) {
    throw new Error("EMAIL_TAKEN");
  }

  const userId = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password);

  await query(
    `
      INSERT INTO users (id, email, password_hash)
      VALUES ($1, $2, $3)
    `,
    [userId, email, passwordHash]
  );

  await createSiteForUser(userId, {
    name: siteName
  });

  return {
    id: userId,
    email
  };
}

export async function signInUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const result = await query<UserRow>(
    `
      SELECT id, email, password_hash, created_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const matches = await verifyPasswordHash(password.trim(), row.password_hash);
  if (!matches) {
    return null;
  }

  return mapUser(row);
}

export async function setUserSession(userId: string) {
  const sessionId = randomBytes(16).toString("hex");
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const cookieStore = await cookies();

  await query(
    `
      INSERT INTO auth_sessions (id, user_id, token_hash, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')
    `,
    [sessionId, userId, tokenHash]
  );

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS
  });
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await query(
      `
        DELETE FROM auth_sessions
        WHERE token_hash = $1
      `,
      [hashSessionToken(token)]
    );
  }

  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const result = await query<{
    id: string;
    email: string;
    created_at: string;
  }>(
    `
      SELECT u.id, u.email, u.created_at
      FROM auth_sessions s
      INNER JOIN users u
        ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [hashSessionToken(token)]
  );

  const row = result.rows[0];
  if (!row) {
    cookieStore.delete(AUTH_COOKIE_NAME);
    return null;
  }

  return mapUser(row);
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
