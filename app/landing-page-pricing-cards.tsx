"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { useId, useState } from "react";
import {
  LANDING_FREE_FEATURES,
  LANDING_PRO_DEFAULT_TEAM_SIZE,
  LANDING_PRO_FEATURES,
  LANDING_PRO_MAX_TEAM_SIZE,
  LANDING_PRO_MIN_TEAM_SIZE,
  LANDING_STARTER_FEATURES,
  clampLandingProTeamSize,
  getLandingFreePrice,
  getLandingProPricingQuote,
  getLandingStarterPrice,
  type LandingBillingInterval
} from "@/lib/landing-pricing";
import { PricingFeature } from "./landing-page-pricing-feature";

export function LandingFreePricingCard() {
  const price = getLandingFreePrice();

  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-8">
      <p className="text-xl font-semibold text-slate-900">Free</p>
      <p className="mt-2 text-sm text-slate-500">For solo teams getting started</p>

      <div className="mt-6">
        <div className="flex items-end gap-1 text-slate-900">
          <span className="text-5xl font-bold leading-none">{price.totalLabel}</span>
          <span className="pb-1 text-base text-slate-500">{price.cadenceLabel}</span>
        </div>
      </div>

      <ul className="mt-8 space-y-3.5">
        {LANDING_FREE_FEATURES.map((feature) => (
          <PricingFeature key={feature}>{feature}</PricingFeature>
        ))}
      </ul>

      <Link
        href="/signup"
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] border border-slate-300 bg-white px-5 text-[15px] font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Get started free
      </Link>
    </article>
  );
}

export function LandingStarterPricingCard({ interval }: { interval: LandingBillingInterval }) {
  const price = getLandingStarterPrice(interval);

  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-8">
      <p className="text-xl font-semibold text-slate-900">Starter</p>
      <p className="mt-2 text-sm text-slate-500">For small teams up to 3 users</p>

      <div className="mt-6">
        <div className="flex items-end gap-1 text-slate-900">
          <span className="text-5xl font-bold leading-none">{price.totalLabel}</span>
          <span className="pb-1 text-base text-slate-500">{price.cadenceLabel}</span>
        </div>
        {price.yearlyNote ? <p className="mt-2 text-sm text-slate-400">{price.yearlyNote}</p> : null}
      </div>

      <ul className="mt-8 space-y-3.5">
        {LANDING_STARTER_FEATURES.map((feature) => (
          <PricingFeature key={feature}>{feature}</PricingFeature>
        ))}
      </ul>

      <Link
        href="/signup"
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] border border-slate-300 bg-white px-5 text-[15px] font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Start free trial
      </Link>
    </article>
  );
}

export function LandingProPricingCard({ interval }: { interval: LandingBillingInterval }) {
  const sliderLabelId = useId();
  const [teamSize, setTeamSize] = useState(LANDING_PRO_DEFAULT_TEAM_SIZE);
  const quote = getLandingProPricingQuote(teamSize, interval);
  const progress =
    ((teamSize - LANDING_PRO_MIN_TEAM_SIZE) / (LANDING_PRO_MAX_TEAM_SIZE - LANDING_PRO_MIN_TEAM_SIZE)) * 100;

  function handleSliderKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "PageUp") {
      event.preventDefault();
      setTeamSize((current) => clampLandingProTeamSize(current + 5));
    }

    if (event.key === "PageDown") {
      event.preventDefault();
      setTeamSize((current) => clampLandingProTeamSize(current - 5));
    }

    if (event.key === "Home") {
      event.preventDefault();
      setTeamSize(LANDING_PRO_MIN_TEAM_SIZE);
    }

    if (event.key === "End") {
      event.preventDefault();
      setTeamSize(LANDING_PRO_MAX_TEAM_SIZE);
    }
  }

  return (
    <article className="relative rounded-[20px] border-2 border-blue-600 bg-white p-8 shadow-[0_4px_20px_rgba(37,99,235,0.15)]">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-[13px] font-medium uppercase tracking-[0.04em] text-white">
        Most Popular
      </div>

      <p className="mt-3 text-xl font-semibold text-slate-900">Pro</p>
      <p className="mt-2 text-sm text-slate-500">For growing teams that need more</p>

      <div className="mt-6">
        <label id={sliderLabelId} className="block text-sm font-medium text-slate-700">
          How many team members?
        </label>
        <div className="mt-4 inline-flex rounded-[8px] bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
          {quote.teamLabel}
        </div>

        <div className="mt-5">
          <div className="relative h-8">
            <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
            <div
              className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-blue-600 transition-[width] duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={LANDING_PRO_MIN_TEAM_SIZE}
              max={LANDING_PRO_MAX_TEAM_SIZE}
              value={teamSize}
              aria-labelledby={sliderLabelId}
              aria-valuemin={LANDING_PRO_MIN_TEAM_SIZE}
              aria-valuemax={LANDING_PRO_MAX_TEAM_SIZE}
              aria-valuenow={teamSize}
              aria-valuetext={quote.valueText}
              onChange={(event) => setTeamSize(clampLandingProTeamSize(Number(event.target.value)))}
              onKeyDown={handleSliderKeyDown}
              className="landing-pricing-range absolute inset-0"
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{LANDING_PRO_MIN_TEAM_SIZE}</span>
            <span>{LANDING_PRO_MAX_TEAM_SIZE}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-1 text-slate-900">
          <span key={`${interval}-${teamSize}`} className="landing-pricing-amount text-5xl font-bold leading-none">
            {quote.totalLabel}
          </span>
          <span className="pb-1 text-base text-slate-500">{quote.cadenceLabel}</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{quote.perUserLabel}</p>
        {quote.savingsLabel ? (
          <div
            key={`${interval}-${teamSize}-savings`}
            className="landing-pricing-badge mt-3 inline-flex rounded-[6px] border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
          >
            {quote.savingsLabel}
          </div>
        ) : null}
      </div>

      <ul className="mt-8 space-y-3.5">
        {LANDING_PRO_FEATURES.map((feature) => (
          <PricingFeature key={feature}>{feature}</PricingFeature>
        ))}
      </ul>

      <Link
        href="/signup"
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-blue-600 px-5 text-[15px] font-medium text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:bg-blue-700"
      >
        Start free trial
      </Link>
    </article>
  );
}
