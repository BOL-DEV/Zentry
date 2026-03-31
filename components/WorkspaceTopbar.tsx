"use client";

import Link from "next/link";
import DashboardLogoutButton from "@/components/DashboardLogoutButton";

function WorkspaceTopbar({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Back",
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 dark:text-slate-300">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {backLabel}
            </Link>
          ) : null}

          <DashboardLogoutButton />
        </div>
      </div>
    </div>
  );
}

export default WorkspaceTopbar;
