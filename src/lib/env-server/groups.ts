import "server-only";

import { getRequiredEnvVarNamesForGroup, type AppEnvValidationGroup } from "@/lib/env-config";
import { getOptionalServerEnv, type ServerEnvSource } from "@/lib/env-server/core";
import { getMissingEnvVarNames } from "@/lib/env-core";

export function getMissingEnvVarsForGroup(
  group: AppEnvValidationGroup,
  source: ServerEnvSource = process.env
) {
  return getMissingEnvVarNames(getRequiredEnvVarNamesForGroup(group), source);
}

export function getMissingMiniMaxEnvVars(params?: {
  source?: ServerEnvSource;
}) {
  return getMissingEnvVarsForGroup("minimax", params?.source || process.env);
}

export function getMissingSesEnvVars(params?: {
  source?: ServerEnvSource;
}) {
  const source = params?.source || process.env;
  const missing = new Set(getMissingEnvVarsForGroup("ses", source));
  const accessKeyId = getOptionalServerEnv("AWS_ACCESS_KEY_ID", source);
  const secretAccessKey = getOptionalServerEnv("AWS_SECRET_ACCESS_KEY", source);

  if ((accessKeyId && !secretAccessKey) || (!accessKeyId && secretAccessKey)) {
    missing.add("AWS_ACCESS_KEY_ID");
    missing.add("AWS_SECRET_ACCESS_KEY");
  }

  return Array.from(missing);
}
