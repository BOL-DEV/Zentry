"use client";

import { ClipLoader } from "react-spinners";

function LoadingPulseCard({
  title = "Loading",
  description = "Please hold on while we pull the latest data.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-500/15">
          <ClipLoader color="#7e22ce" size={22} speedMultiplier={0.9} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingPulseCard;
