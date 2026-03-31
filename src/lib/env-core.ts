import { getEnvDefinition } from "@/lib/env-config";

export type EnvSource = Record<string, string | undefined>;

export function normalizeEnvValue(value: unknown) {
  return String(value || "").trim();
}

export function readEnvValue(
  name: string,
  source: EnvSource,
  options?: {
    includeDefault?: boolean;
  }
) {
  const definition = getEnvDefinition(name);
  const candidateNames = definition ? [name, ...(definition.aliases || [])] : [name];

  for (const candidateName of candidateNames) {
    const value = normalizeEnvValue(source[candidateName]);
    if (value) {
      return value;
    }
  }

  if (options?.includeDefault !== false) {
    const defaultValue = normalizeEnvValue(definition?.defaultValue);
    if (defaultValue) {
      return defaultValue;
    }
  }

  return "";
}

export function getMissingEnvVarNames(requiredEnvVarNames: readonly string[], source: EnvSource) {
  return requiredEnvVarNames.filter(
    (envVarName) => !readEnvValue(envVarName, source, { includeDefault: false })
  );
}
