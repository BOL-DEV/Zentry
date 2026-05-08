import Link from "next/link";

function OffersHeroSection() {
  const highlights = [
    "White-label organizer pages",
    "Ticket sales and QR verification",
    "Organizer, staff, and admin controls",
  ];

  return (
    <section className="overflow-hidden px-6 pb-18 pt-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-600 dark:text-violet-300">
            Zentra Platform
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            White-label ticketing and verification for organizers who need real operational control.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Launch branded organizer pages, sell tickets, verify entry with QR scans, manage staff
            access, and keep admin oversight connected across the full event lifecycle.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-violet-400/20 dark:bg-white/5 dark:text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/organizer-request"
              className="flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-600/30 dark:focus-visible:ring-violet-400/30"
            >
              Apply as Organizer
            </Link>
            <Link
              href="/offers#pricing"
              className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/40 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              View Platform Model
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-cyan-400/20 blur-3xl" />
          <div className="rounded-[2rem] border border-violet-200/70 bg-white/85 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-5 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Public Experience
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Branded organizer storefronts
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Give each organizer a clean public presence for upcoming events, past moments,
                  gallery content, and event detail pages.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-5 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Entry Control
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                  Fast QR-based validation
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Verify tickets quickly, block duplicates, and monitor check-ins without breaking
                  the gate flow.
                </p>
              </div>
              <div className="rounded-2xl bg-violet-600 p-5 text-white sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-100">
                  Operations Layer
                </p>
                <p className="mt-3 text-lg font-semibold">
                  Organizer dashboards, staff security, and admin oversight stay in one system.
                </p>
                <p className="mt-2 text-sm leading-6 text-violet-100">
                  Review organizer requests, manage dashboard users, control session limits, and
                  monitor events, tickets, and sales from a centralized backend workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OffersHeroSection;
