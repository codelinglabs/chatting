import { normalizeEnvValue, readEnvValue, type EnvSource } from "@/lib/env-core";

export type RuntimeEnvironment = "development" | "production" | "test";

export function getRuntimeEnvironment(value: unknown = process.env.NODE_ENV): RuntimeEnvironment {
  const normalized = normalizeEnvValue(value);

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

export function getRuntimeEnvironmentLabel(value: unknown = process.env.NODE_ENV) {
  return isProductionRuntime(value) ? "your deployment environment" : "your local .env file";
}

export function isNodeRuntime(value: unknown = process.env.NEXT_RUNTIME) {
  return normalizeEnvValue(value) === "nodejs";
}

export function getPublicAppUrl(source: EnvSource = process.env) {
  return readEnvValue("NEXT_PUBLIC_APP_URL", source)!;
}
