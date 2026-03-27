export type RuntimeEnvironment = "development" | "production" | "test";

function normalize(value: unknown) {
  return String(value || "").trim();
}

export function getRuntimeEnvironment(value: unknown = process.env.NODE_ENV): RuntimeEnvironment {
  const normalized = normalize(value);

  if (normalized === "production") {
    return "production";
  }

  if (normalized === "test") {
    return "test";
  }

  return "development";
}

export function isProductionRuntime(value: unknown = process.env.NODE_ENV) {
  return getRuntimeEnvironment(value) === "production";
}

export function getPublicAppUrl() {
  return normalize(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000";
}
