import { createHash } from "node:crypto";

export function gravatarUrlForEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const hash = createHash("md5").update(normalized).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=404&s=160`;
}
