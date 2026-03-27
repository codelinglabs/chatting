export function isHighIntentPage(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const path = new URL(value).pathname.toLowerCase();
    return [
      "/pricing",
      "/plans",
      "/checkout",
      "/book",
      "/demo",
      "/signup",
      "/trial",
      "/billing",
      "/contact-sales",
      "/enterprise",
      "/sales"
    ].some((needle) => path.includes(needle));
  } catch (error) {
    const path = value.toLowerCase();
    return [
      "pricing",
      "plans",
      "checkout",
      "book",
      "demo",
      "signup",
      "trial",
      "billing",
      "contact-sales",
      "enterprise",
      "sales"
    ].some((needle) => path.includes(needle));
  }
}

export function previewIncomingMessage(content: string, attachmentsCount: number) {
  const text = content.trim();
  if (text) {
    return text;
  }

  if (attachmentsCount <= 0) {
    return "A visitor sent a new message.";
  }

  return attachmentsCount === 1 ? "Shared an attachment" : `Shared ${attachmentsCount} attachments`;
}
