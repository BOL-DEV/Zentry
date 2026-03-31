"use client";

import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/helpers/auth";

function DashboardLogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        clearAuthToken();
        router.push("/login");
      }}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      Logout
    </button>
  );
}

export default DashboardLogoutButton;
