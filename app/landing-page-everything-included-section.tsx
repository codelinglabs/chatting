import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  CopyIcon,
  MailIcon,
  PaintbrushIcon,
  PaperclipIcon,
  StarIcon,
  UsersIcon
} from "./dashboard/dashboard-ui";

type FeatureIcon = ComponentType<SVGProps<SVGSVGElement>>;

const includedFeatures: Array<{
  title: string;
  body: string;
  icon: FeatureIcon;
  tone: string;
}> = [
  {
    title: "Widget Customization",
    body: "Your colors, your logo, your welcome message. Looks native.",
    icon: PaintbrushIcon,
    tone: "bg-blue-50 text-blue-600"
  },
  {
    title: "Analytics",
    body: "Response times, busiest hours, team performance, satisfaction scores.",
    icon: BarChartIcon,
    tone: "bg-violet-50 text-violet-600"
  },
  {
    title: "AI Assist",
    body: "Summarize threads, get reply suggestions, auto-tag conversations. AI helps — you decide.",
    icon: StarIcon,
    tone: "bg-amber-50 text-amber-600"
  },
  {
    title: "Saved Replies",
    body: "Common responses in one click. Stop retyping.",
    icon: CopyIcon,
    tone: "bg-emerald-50 text-emerald-700"
  },
  {
    title: "File Sharing",
    body: "Screenshots, PDFs, invoices — right in the conversation.",
    icon: PaperclipIcon,
    tone: "bg-rose-50 text-rose-600"
  },
  {
    title: "Team Management",
    body: "Invite teammates, assign roles, see who's online.",
    icon: UsersIcon,
    tone: "bg-slate-100 text-slate-700"
  },
  {
    title: "Email Fallback",
    body: "Visitor leaves? Conversation continues over email. They reply, it's back in chat.",
    icon: MailIcon,
    tone: "bg-[#EEF2FF] text-[#4338CA]"
  }
] as const;

const desktopColumns = [
  ["Widget Customization", "Saved Replies", "Team Management"],
  ["Analytics", "File Sharing"],
  ["AI Assist", "Email Fallback"]
] as const;

function IncludedFeatureCard({
  body,
  icon: Icon,
  title,
  tone
}: {
  body: string;
  icon: FeatureIcon;
  title: string;
  tone: string;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_22px_54px_rgba(15,23,42,0.08)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-[14px] ${tone}`}>
        <Icon className="h-[22px] w-[22px]" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function getIncludedFeature(title: (typeof includedFeatures)[number]["title"]) {
  return includedFeatures.find((feature) => feature.title === title);
}

export function LandingEverythingIncludedSection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl px-2 text-center">
          <h2 className="display-font text-4xl leading-[1.12] text-slate-900 sm:text-5xl">
            Everything else included.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 px-2 md:grid-cols-2 xl:hidden">
          {includedFeatures.map((feature) => (
            <IncludedFeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mt-16 hidden grid-cols-3 gap-6 px-2 xl:grid">
          {desktopColumns.map((column, index) => (
            <div key={`included-column-${index}`} className="space-y-6">
              {column.map((title) => {
                const feature = getIncludedFeature(title);
                return feature ? <IncludedFeatureCard key={feature.title} {...feature} /> : null;
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
