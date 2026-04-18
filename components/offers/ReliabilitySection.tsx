import Card from "@/components/Card";

const reliabilityPoints = [
  "Unique QR-backed ticket validation",
  "Duplicate scans blocked in real time",
  "Staff session controls for device access",
  "Organizer and admin visibility into event activity",
  "Cleaner approval flow for new organizers",
  "Built-in structure for operational oversight",
];

function ReliabilitySection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
            Reliability
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built for event-day pressure, not only pre-event setup.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300">
            Zentry is designed around the moments that usually break weak systems: entry rush,
            staff access, platform oversight, and post-event reconciliation. The goal is simple:
            fewer manual workarounds and more operational confidence.
          </p>
        </div>

        <Card className="h-full border-violet-200/80 bg-gradient-to-br from-white to-violet-50 dark:border-violet-400/20 dark:bg-none dark:bg-slate-900/85 dark:from-transparent dark:to-transparent">
          <ul className="space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            {reliabilityPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-violet-600 dark:bg-violet-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </section>
  );
}

export default ReliabilitySection;
