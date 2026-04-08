import { setupSteps } from "./landing-page-data";
import {
  CustomizeStepVisual,
  InstallSnippetVisual,
  StartTalkingStepVisual
} from "./landing-page-how-it-works-visuals";
import { LandingPricingSection } from "./landing-page-pricing-section";

const stepVisuals = [InstallSnippetVisual, CustomizeStepVisual, StartTalkingStepVisual] as const;

function StepConnector() {
  return (
    <div className="flex items-center justify-center py-3 md:hidden">
      <div className="flex items-center gap-2">
        <span className="h-10 w-px border-l border-dashed border-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}

export function LandingConversionSections() {
  return (
    <>
      <section id="how-it-works" className="bg-white">
        <div className="mx-auto w-full max-w-[1360px] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl px-2 text-center">
            <h2 className="display-font text-4xl text-slate-900 sm:text-5xl">Live in 3 minutes. Seriously.</h2>
          </div>

          <div className="mt-16 grid gap-6 px-2 md:grid-cols-2 md:gap-8 xl:grid-cols-3 xl:gap-10">
            {setupSteps.map((step, index) => {
              const Visual = stepVisuals[index];

              return (
                <div key={step.number} className="flex h-full flex-col">
                  <article className="rounded-[34px] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-1.5">
                    <div className="rounded-[30px] border border-slate-200 bg-white px-5 py-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)] sm:px-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        {step.number}
                      </div>
                      <div className="mt-6 rounded-[30px] bg-[radial-gradient(circle_at_top,rgba(219,234,254,0.7),rgba(248,250,252,0)_58%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)] p-3 sm:p-4">
                        <Visual />
                      </div>
                      <div className="mt-6">
                        <h3 className="text-2xl font-semibold text-slate-900">{step.title}</h3>
                        <p className="mt-3 text-[15px] leading-7 text-slate-600">{step.body}</p>
                      </div>
                    </div>
                  </article>
                  {index < setupSteps.length - 1 ? <StepConnector /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingPricingSection />
    </>
  );
}
