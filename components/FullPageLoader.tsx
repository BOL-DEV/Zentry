"use client";

import { ClipLoader } from "react-spinners";

function FullPageLoader({
  title: _title = "Loading",
  description: _description = "Please wait while we fetch the latest data.",
}: {
  title?: string;
  description?: string;
}) {
  void _title;
  void _description;

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6 py-16 dark:bg-slate-950/90">
      <div className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-white/90 shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/80">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/15">
          <ClipLoader color="#7e22ce" size={36} speedMultiplier={0.9} />
        </div>
      </div>
    </div>
  );
}

export default FullPageLoader;
