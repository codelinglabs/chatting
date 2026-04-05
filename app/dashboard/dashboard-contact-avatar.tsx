"use client";

import { useEffect, useState } from "react";
import {
  contactAvatarInitials,
  normalizeContactAvatarUrl,
  shouldShowContactAvatarImage
} from "./dashboard-contact-avatar.utils";

export function DashboardContactAvatar({
  name,
  avatarUrl,
  size = "md"
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const normalizedAvatarUrl = normalizeContactAvatarUrl(avatarUrl);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [normalizedAvatarUrl]);

  const sizeClass =
    size === "sm"
      ? "h-10 w-10 text-sm"
      : size === "lg"
        ? "h-16 w-16 text-[22px]"
        : "h-12 w-12 text-sm";

  if (shouldShowContactAvatarImage(normalizedAvatarUrl, hasImageError)) {
    return (
      <img
        src={normalizedAvatarUrl!}
        alt={name}
        className={`${sizeClass} rounded-full border border-slate-200 object-cover`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-100 font-medium text-blue-700 ${sizeClass}`}
    >
      {contactAvatarInitials(name)}
    </div>
  );
}
