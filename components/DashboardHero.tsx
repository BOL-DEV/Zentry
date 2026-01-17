import Link from "next/link";
import { FiLogOut } from "react-icons/fi";



function DashboardHero() {
  return (
    <section className="flex lg:max-w-7xl mx-auto flex-row items-center md:justify-between px-6 py-10 pt-24 bg-white text-slate-900 dark:bg-slate-950 dark:text-white dark:border-white/10">
      <div>
        <h1 className="lg:text-5xl text-4xl  font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 lg:text-md text-sm text-slate-600 dark:text-slate-300">
          Manage your events and track ticket sales
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        <FiLogOut className="text-base" />
        Logout
      </Link>
    </section>
  );
}

export default DashboardHero;
