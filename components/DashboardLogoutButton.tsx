"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/helpers/auth";
import { logoutDashboardUser } from "@/helpers/organizer-api";

function DashboardLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setIsLoggingOut(true);

        try {
          await logoutDashboardUser();
        } catch {
          // Clear the local session even if the backend session is already gone.
        } finally {
          clearAuthToken();
          router.push("/login");
          setIsLoggingOut(false);
        }
      }}
      disabled={isLoggingOut}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}

export default DashboardLogoutButton;
