function collapseBlankLines(value: string) {
  return value.replace(/\n{3,}/g, "\n\n").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const CTA_PATTERNS = [
  /Continue the conversation here:\s*\n\s*(\{\{conversation_link\}\}|https?:\/\/\S+)/gi,
  /If you ever want to continue the conversation, you can\s+\[jump back in here\]\((\{\{conversation_link\}\}|https?:\/\/[^)\s]+)\)\.?/gi,
  /If anything else comes up, you can\s+\[continue the conversation here\]\((\{\{conversation_link\}\}|https?:\/\/[^)\s]+)\)\.?/gi,
  /If you'd like to\s+\[continue the conversation\]\((\{\{conversation_link\}\}|https?:\/\/[^)\s]+)\)\.?/gi,
  /Or just reply to this email and it goes straight to us\.?/gi
];

export function trimVisitorEmailIntro(value: string, title: string) {
  return collapseBlankLines(value.replace(new RegExp(`^\\s*${escapeRegExp(title)}[.!]?\\s*`, "i"), ""));
}

export function trimVisitorEmailOutro(value: string) {
  return collapseBlankLines(CTA_PATTERNS.reduce((output, pattern) => output.replace(pattern, "\n\n"), value));
}
