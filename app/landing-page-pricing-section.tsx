"use client";

import { useId, useState } from "react";
import { LANDING_PRICING_YEARLY_SAVINGS_LABEL, type LandingBillingInterval } from "@/lib/landing-pricing";
import { CheckIcon } from "./dashboard/dashboard-ui";
import { LandingFreePricingCard, LandingProPricingCard, LandingStarterPricingCard } from "./landing-page-pricing-cards";

export function LandingPricingSection() {
  const headingId = useId();
  const [interval, setInterval] = useState<LandingBillingInterval>("monthly");

  return (
    <section id="pricing" className="bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24">
        <div className="mx-auto max-w-[600px] text-center">
          <div className="inline-flex rounded-full bg-blue-50 px-[14px] py-[6px] text-[13px] font-medium text-blue-700">
            Pricing
          </div>
          <h2 id={headingId} className="display-font mt-4 text-4xl leading-tight text-slate-900 sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-500">Choose the plan that&apos;s right for you</p>
        </div>

        <div className="mt-10 flex justify-center">
          <div role="radiogroup" aria-label="Billing frequency" className="inline-flex rounded-[12px] bg-slate-100 p-1">
            {(["monthly", "yearly"] as LandingBillingInterval[]).map((value) => {
              const active = interval === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setInterval(value)}
                  className={`rounded-[10px] px-5 py-3 text-[15px] font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>{value === "yearly" ? "Yearly" : "Monthly"}</span>
                  {value === "yearly" ? (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {LANDING_PRICING_YEARLY_SAVINGS_LABEL}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div role="group" aria-labelledby={headingId} className="mx-auto mt-12 grid max-w-[1120px] gap-6 lg:grid-cols-3">
          <LandingFreePricingCard />
          <LandingStarterPricingCard interval={interval} />
          <LandingProPricingCard interval={interval} />
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckIcon className="h-3 w-3" />
          </span>
          <span>No credit card required</span>
        </div>
      </div>
    </section>
  );
}
