import Card from "@/components/Card";

type Step = {
  stepLabel: string;
  title: string;
  bullets: string[];
};

const steps: Step[] = [
  {
    stepLabel: "Step 1",
    title: "Create Event",
    bullets: ["Upload flyer", "Set date & location", "Configure ticket types"],
  },
  {
    stepLabel: "Step 2",
    title: "Sell Tickets",
    bullets: [
      "Secure checkout",
      "Automatic ticket generation",
      "Unique QR code per ticket",
      "Email delivery",
    ],
  },
  {
    stepLabel: "Step 3",
    title: "Validate Entry",
    bullets: [
      "QR code scanning",
      "Instant validation",
      "Prevent duplicate check-ins",
      "Real-time check-in tracking",
    ],
  },
  {
    stepLabel: "Step 4",
    title: "Track Performance",
    bullets: [
      "Live revenue dashboard",
      "Ticket sales analytics",
      "Attendee management",
      "Export reports",
    ],
  },
];

function HowItWorksSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          How It Works
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <Card key={s.title} className="h-full">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                {s.stepLabel}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                {s.title}
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {s.bullets.map((b) => (
                  <li key={b}>{b}</li>
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
