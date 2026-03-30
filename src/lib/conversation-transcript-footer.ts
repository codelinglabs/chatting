import { normalizeBillingPlanKey, type BillingPlanKey } from "@/lib/billing-plans";

export type TranscriptBrandingPlanKey = BillingPlanKey | null;
export type TranscriptViralVariant =
  | "variant_a"
  | "variant_b"
  | "variant_c"
  | "variant_d"
  | "variant_e";

export type ConversationTranscriptFooterContent = {
  viral: {
    hookText: string;
    brandText: string;
    ctaLabel: string;
    href: string;
    text: string;
  } | null;
  legal: {
    attributionText: string;
    privacyLabel: string;
    privacyHref: string;
    text: string;
  } | null;
};

const DEFAULT_VIRAL_VARIANT: TranscriptViralVariant = "variant_a";

const VARIANT_COPY: Record<
  TranscriptViralVariant,
  {
    hookText: string;
    brandText: string;
    ctaLabel: string;
  }
> = {
  variant_a: {
    hookText: "\u{1F4AC} Enjoying fast, friendly support?",
    brandText: "Powered by Chatting \u2014 live chat for small teams",
    ctaLabel: "Try Chatting Free \u2192"
  },
  variant_b: {
    hookText: "\u{1F4AC} Wondering what chat tool this is?",
    brandText: "{{team_name}} uses Chatting for instant customer support",
    ctaLabel: "See how it works \u2192"
  },
  variant_c: {
    hookText: "\u{1F4AC} 2,400+ teams use Chatting for faster support",
    brandText: "Response times under 2 minutes, every time",
    ctaLabel: "Start your free trial \u2192"
  },
  variant_d: {
    hookText: "\u{1F4AC} Wish all companies responded this fast?",
    brandText: "Chatting helps small teams reply in minutes, not hours",
    ctaLabel: "Try it on your site \u2192"
  },
  variant_e: {
    hookText: "",
    brandText: "Powered by Chatting \u2014 live chat that actually feels instant",
    ctaLabel: "Learn more \u2192"
  }
};

function buildPrivacyUrl(appUrl: string) {
  return new URL("/privacy", appUrl).toString();
}

function buildViralUrl(input: {
  appUrl: string;
  companySlug: string;
  variant: TranscriptViralVariant;
  utmSource: "transcript_email" | "visitor_email";
}) {
  const url = new URL(input.appUrl);

  url.search = "";
  url.searchParams.set("utm_source", input.utmSource);
  url.searchParams.set("utm_medium", "email");
  url.searchParams.set("utm_campaign", "viral_footer");
  url.searchParams.set("utm_content", input.variant);
  url.searchParams.set("ref", input.companySlug);

  return url.toString();
}

function toCompanySlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "team";
}

function resolveVariantCopy(teamName: string, variant: TranscriptViralVariant) {
  const copy = VARIANT_COPY[variant];
  return {
    hookText: copy.hookText,
    brandText: copy.brandText.replace("{{team_name}}", teamName),
    ctaLabel: copy.ctaLabel
  };
}

export function shouldShowTranscriptViralFooter(planKey: TranscriptBrandingPlanKey) {
  return normalizeBillingPlanKey(planKey) === "starter";
}

export function buildConversationTranscriptFooterContent(input: {
  appUrl: string;
  teamName: string;
  showViralFooter: boolean;
  viralVariant?: TranscriptViralVariant;
  utmSource?: "transcript_email" | "visitor_email";
}): ConversationTranscriptFooterContent {
  if (!input.showViralFooter) {
    return {
      viral: null,
      legal: null
    };
  }

  const variant = input.viralVariant ?? DEFAULT_VIRAL_VARIANT;
  const copy = resolveVariantCopy(input.teamName, variant);
  const href = buildViralUrl({
    appUrl: input.appUrl,
    companySlug: toCompanySlug(input.teamName),
    variant,
    utmSource: input.utmSource ?? "transcript_email"
  });
  const privacyHref = buildPrivacyUrl(input.appUrl);
  const attributionText = `This email was sent by ${input.teamName} using Chatting.`;
  const text = [copy.hookText, copy.brandText, `${copy.ctaLabel}: ${href}`]
    .filter(Boolean)
    .join("\n\n");

  return {
    viral: {
      ...copy,
      href,
      text
    },
    legal: {
      attributionText,
      privacyLabel: "Privacy Policy",
      privacyHref,
      text: `${attributionText}\nPrivacy Policy: ${privacyHref}`
    }
  };
}
