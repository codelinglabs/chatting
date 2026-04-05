import { initialsFromLabel } from "@/lib/user-display";

export function normalizeContactAvatarUrl(avatarUrl?: string | null) {
  const normalized = avatarUrl?.trim();
  return normalized ? normalized : null;
}

export function shouldShowContactAvatarImage(avatarUrl?: string | null, hasImageError = false) {
  return Boolean(normalizeContactAvatarUrl(avatarUrl) && !hasImageError);
}

export function contactAvatarInitials(name: string) {
  return initialsFromLabel(name);
}
