"use client";

import { ClipLoader } from "react-spinners";

function FullPageLoader({
  title = "Loading",
  description = "Please wait while we fetch the latest data.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6 py-16 dark:bg-slate-950/90">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/80">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/15">
          <ClipLoader color="#7e22ce" size={36} speedMultiplier={0.9} />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
    </div>
  );
}

export default FullPageLoader;
