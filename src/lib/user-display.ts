function titleCaseWord(word: string) {
  if (!word) {
    return "";
  }

  return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
}

export function displayNameFromEmail(email: string) {
  const localPart = email.trim().split("@")[0] || "Visitor";
  const cleaned = localPart.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "Visitor";
  }

  return cleaned
    .split(" ")
    .map(titleCaseWord)
    .join(" ");
}

export function firstNameFromDisplayName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

export function initialsFromLabel(label: string) {
  const words = label
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "??";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

