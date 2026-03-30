import Link from "next/link";
import Card from "@/components/Card";

function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Pricing
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                  Free Plan
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  FREE
                </h3>
              </div>
            </div>

            <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>Up to 2 active events</li>
              <li>Basic analytics</li>
              <li>Standard support</li>
              <li>Platform branding</li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Platform fee:
                </span>{" "}
                5% per ticket sold
              </li>
            </ul>

            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-lg border-2 border-purple-600 px-6 py-3 font-semibold text-purple-600 transition hover:bg-purple-700 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/20 dark:focus-visible:ring-purple-400/20"
            >
              Start Free
            </Link>
          </Card>

          <Card className="h-full border-purple-300 bg-purple-50 ring-2 ring-purple-600/15 dark:border-purple-400/30 dark:bg-white/5 dark:ring-purple-400/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                  Pro Plan
                </p>
                <h3 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  PRO
                </h3>
              </div>
              <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
                Best Value
              </span>
            </div>

            <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
              <li>Unlimited events</li>
              <li>Advanced analytics</li>
              <li>Custom branding</li>
              <li>Priority support</li>
              <li>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Platform fee:
                </span>{" "}
                3% + flat fee per ticket
              </li>
            </ul>

            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 dark:focus-visible:ring-purple-400/30"
            >
              Upgrade to Pro
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
