import Card from "@/components/Card";

type Step = {
  stepLabel: string;
  title: string;
  bullets: string[];
};

const steps: Step[] = [
  {
    stepLabel: "Stage 1",
    title: "Get approved and set your brand",
    bullets: [
      "Submit an organizer request",
      "Complete organizer profile and branding",
      "Prepare your public event presence",
    ],
  },
  {
    stepLabel: "Stage 2",
    title: "Launch events and sell tickets",
    bullets: [
      "Create event pages with ticket types",
      "Collect orders through secure checkout",
      "Issue QR-backed tickets automatically",
    ],
  },
  {
    stepLabel: "Stage 3",
    title: "Run entry with staff control",
    bullets: [
      "Manage organizer and staff access",
      "Verify tickets with live QR scans",
      "Monitor sessions and revoke when needed",
    ],
  },
  {
    stepLabel: "Stage 4",
    title: "Review performance and reconcile",
    bullets: [
      "Track ticket sales and check-ins",
      "Review attendees and event activity",
      "Keep admin oversight and reporting aligned",
    ],
  },
];

function HowItWorksSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            How Zentry moves from onboarding to event-day control.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.title} className="h-full">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                {step.stepLabel}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {step.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
