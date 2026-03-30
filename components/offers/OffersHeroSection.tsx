import Link from "next/link";

function OffersHeroSection() {
  return (
    <section className="px-6 pt-32 pb-16 text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Everything You Need to Run Successful Events
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
          From ticket sales to entry validation and revenue tracking — manage it all in one
          platform.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 dark:focus-visible:ring-purple-400/30"
          >
            Create Your Event
          </Link>
          <Link
            href="#pricing"
            className="flex items-center justify-center rounded-lg border-2 border-purple-600 px-6 py-3 font-semibold text-purple-600 transition hover:bg-purple-700 hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/20 dark:focus-visible:ring-purple-400/20"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OffersHeroSection;
