import "server-only";

import { getMissingEnvVarNames, readEnvValue, type EnvSource } from "@/lib/env-core";

export type ServerEnvSource = EnvSource;

export function getMissingRequiredEnvVars(
  requiredEnvVarNames: readonly string[],
  source: ServerEnvSource
) {
  return getMissingEnvVarNames(requiredEnvVarNames, source);
}

export function getOptionalServerEnv(
  name: string,
  source: ServerEnvSource = process.env
) {
  const value = readEnvValue(name, source);
  return value || null;
}

export function getRequiredServerEnv(
  name: string,
  options?: {
    errorCode?: string;
    source?: ServerEnvSource;
  }
) {
  const source = options?.source || process.env;
  const value = readEnvValue(name, source, { includeDefault: false });

  if (!value) {
    throw new Error(options?.errorCode || `${name}_NOT_CONFIGURED`);
  }

  return value;
}
