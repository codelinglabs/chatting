const LOCAL_HOST_PREFIXES = ["localhost", "127.0.0.1", "[::1]", "::1", "0.0.0.0"];

export function isLocalHostLike(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized ? LOCAL_HOST_PREFIXES.some((prefix) => normalized.startsWith(prefix)) : false;
}

export function shouldLoadRemoteScript(hostname: string | null | undefined) {
  return !isLocalHostLike(hostname);
}
