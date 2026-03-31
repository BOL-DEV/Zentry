import Card from "@/components/Card";

function ReliabilitySection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built for Reliable Event Operations
          </h2>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
            Zentry is designed to keep your entry flow clean and your reporting accurate,
            even when the line gets long.
          </p>
        </div>

        <Card>
          <ul className="list-disc space-y-3 pl-5 text-sm text-slate-600 dark:text-slate-300 sm:text-base">
            <li>Unique QR code per ticket</li>
            <li>Duplicate scans blocked</li>
            <li>Refund automatically invalidates ticket</li>
            <li>Real-time updates</li>
            <li>Secure data handling</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}

export default ReliabilitySection;
