export type StyledEmailSection =
  | {
      type: "plain";
      html: string;
      text?: string;
      tone?: "default" | "soft";
    }
  | {
      type: "actions";
      title?: string;
      textTitle?: string;
      links: Array<{
        label: string;
        href: string;
      }>;
      tone?: "default" | "soft";
    };

const EMAIL_SHELL_STYLE = [
  "margin:0",
  "padding:32px 16px",
  "background:#f8fafc",
  "font-family:Avenir Next,Segoe UI,sans-serif"
].join(";");

const EMAIL_CARD_STYLE = [
  "margin:0 auto",
  "max-width:640px",
  "overflow:hidden",
  "border:1px solid #e2e8f0",
  "border-radius:20px",
  "background:#ffffff",
  "box-shadow:0 8px 24px rgba(15,23,42,0.06)"
].join(";");

const EMAIL_INNER_STYLE = [
  "padding:28px 28px 24px",
  "color:#334155"
].join(";");

const EMAIL_TEXT_BLOCK_STYLE = [
  "font-size:14px",
  "line-height:1.75",
  "color:#334155"
].join(";");

const EMAIL_SECTION_BASE_STYLE = [
  "margin-top:20px",
  "border-radius:16px",
  "padding:18px 20px"
].join(";");

const EMAIL_SECTION_TONES = {
  default: [
    EMAIL_SECTION_BASE_STYLE,
    "border:1px solid #e2e8f0",
    "background:#ffffff"
  ].join(";"),
  soft: [
    EMAIL_SECTION_BASE_STYLE,
    "border:1px solid #dbeafe",
    "background:#f8fbff"
  ].join(";")
};

const EMAIL_SECTION_TEXT_STYLE = [
  "font-size:14px",
  "line-height:1.7",
  "color:#475569"
].join(";");

const EMAIL_ACTIONS_ROW_STYLE = [
  "margin-top:14px",
  "display:flex",
  "flex-wrap:wrap",
  "gap:10px"
].join(";");

const EMAIL_ACTION_LINK_STYLE = [
  "display:inline-block",
  "border-radius:999px",
  "background:#2563eb",
  "padding:10px 16px",
  "font-size:13px",
  "font-weight:600",
  "line-height:1",
  "color:#ffffff",
  "text-decoration:none"
].join(";");

const EMAIL_ACTIONS_TITLE_STYLE = [
  "margin:0",
  "font-size:13px",
  "font-weight:600",
  "color:#0f172a"
].join(";");

function renderSectionHtml(section: StyledEmailSection) {
  if (section.type === "plain") {
    return `<div style="${EMAIL_SECTION_TONES[section.tone ?? "default"]}"><div style="${EMAIL_SECTION_TEXT_STYLE}">${section.html}</div></div>`;
  }

  const title = section.title
    ? `<p style="${EMAIL_ACTIONS_TITLE_STYLE}">${section.title}</p>`
    : "";
  const links = section.links
    .map((link) => `<a href="${link.href}" style="${EMAIL_ACTION_LINK_STYLE}">${link.label}</a>`)
    .join("");

  return `<div style="${EMAIL_SECTION_TONES[section.tone ?? "soft"]}">${title}<div style="${EMAIL_ACTIONS_ROW_STYLE}">${links}</div></div>`;
}

function renderSectionText(section: StyledEmailSection) {
  if (section.type === "plain") {
    return section.text?.trim() || "";
  }

  const heading = section.textTitle?.trim() || section.title?.trim() || "";
  const links = section.links.map((link) => `${link.label}: ${link.href}`).join("\n");

  return [heading, links].filter(Boolean).join("\n");
}

export function renderStyledEmailLayout(input: {
  contentHtml: string;
  sections?: StyledEmailSection[];
  includeShell?: boolean;
}) {
  const inner = `<div style="${EMAIL_INNER_STYLE}"><div style="${EMAIL_TEXT_BLOCK_STYLE}">${input.contentHtml}</div>${(
    input.sections ?? []
  )
    .map((section) => renderSectionHtml(section))
    .join("")}</div>`;

  if (input.includeShell === false) {
    return inner;
  }

  return `<div style="${EMAIL_SHELL_STYLE}"><div style="${EMAIL_CARD_STYLE}">${inner}</div></div>`;
}

export function renderStyledEmailTextLayout(input: {
  contentText: string;
  sections?: StyledEmailSection[];
}) {
  return [input.contentText.trim(), ...(input.sections ?? []).map((section) => renderSectionText(section))]
    .filter(Boolean)
    .join("\n\n");
}
