import Link from "next/link";

function Company() {
  return (
    <div className="mt-12 border-t border-purple-200/70 pt-8 dark:border-white/10">
      <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          &copy; {new Date().getFullYear()} Zentry. All rights reserved.
        </p>
        <Link
          href="/admin/login"
          className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400 transition hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400"
          aria-label="Admin login"
        >
          Admin
        </Link>
      </div>
    </div>
  );
}

export default Company;
