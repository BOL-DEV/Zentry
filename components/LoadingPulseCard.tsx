"use client";

import { ClipLoader } from "react-spinners";

function LoadingPulseCard({
  title: _title = "Loading",
  description: _description = "Please hold on while we pull the latest data.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  void _title;
  void _description;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 ${
        compact ? "p-5" : "p-8"
      }`}
    >
      <div className="flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-500/15">
          <ClipLoader color="#7e22ce" size={22} speedMultiplier={0.9} />
        </div>
      </div>
    </div>
  );
}

export default LoadingPulseCard;
