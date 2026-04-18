import Link from "next/link";

import Card from "@/components/Card";

function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
            Platform Model
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Flexible onboarding now, deeper packaging as the platform grows.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Zentry already supports approval-based organizer onboarding, branded organizer
            experiences, and operational dashboards. The commercial model can stay flexible while
            the platform scales.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="h-full dark:border-white/10 dark:bg-slate-900/85">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
              Launch Track
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              Approval-based onboarding
            </h3>
            <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>Admin reviews each organizer request before approval</li>
              <li>Great for controlled rollout and platform quality</li>
              <li>Keeps brand, security, and support expectations aligned</li>
              <li>Lets the team refine operations before wider expansion</li>
            </ul>

            <Link
              href="/organizer-request"
              className="mt-8 flex w-full items-center justify-center rounded-xl border-2 border-violet-600 px-6 py-3 font-semibold text-violet-600 transition hover:bg-violet-700 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-600/20 dark:border-violet-400 dark:text-violet-200 dark:hover:bg-violet-500 dark:hover:text-slate-950 dark:focus-visible:ring-violet-400/20"
            >
              Request Access
            </Link>
          </Card>

          <Card className="h-full border-violet-300 bg-violet-50 ring-2 ring-violet-600/15 dark:border-violet-400/30 dark:bg-slate-900/85 dark:ring-violet-400/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                  Growth Track
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  White-label operator model
                </h3>
              </div>
              <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                Platform Ready
              </span>
            </div>

            <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>Supports organizer branding and public identity</li>
              <li>Pairs event operations with verification infrastructure</li>
              <li>Fits a managed rollout, revenue-share, or subscription model later</li>
              <li>Leaves room for premium controls and service tiers</li>
            </ul>

            <Link
              href="/offers#faq"
              className="mt-8 flex w-full items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-600/30 dark:focus-visible:ring-violet-400/30"
            >
              Explore More
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
