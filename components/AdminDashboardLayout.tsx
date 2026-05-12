"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { clearAdminAuthToken } from "@/helpers/admin-auth";
import { logoutAdminUser } from "@/helpers/organizer-api";

type Props = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  exact?: boolean;
};

function isActivePath(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminDashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/dashboard/admin", exact: true },
      { label: "Organizers", href: "/dashboard/admin/organizers" },
      { label: "Organizer Requests", href: "/dashboard/admin/organizer-requests" },
      { label: "Orders", href: "/dashboard/admin/orders" },
      { label: "Events", href: "/dashboard/admin/events" },
      { label: "Tickets", href: "/dashboard/admin/tickets" },
      { label: "Create Organizer", href: "/dashboard/admin/organizers/create" },
      { label: "Create User", href: "/dashboard/admin/users/create" },
    ],
    [],
  );

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logoutAdminUser();
    } catch {
      // Clear the local session even if the backend session is already gone.
    } finally {
      clearAdminAuthToken();
      router.push("/admin/login");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-purple-100 text-slate-900 dark:bg-slate-950/90 dark:text-white">
      <div className="flex min-h-screen">
        <aside className="w-72 shrink-0 border-r border-purple-200/70 bg-purple-100/70 px-6 py-7 dark:border-white/10 dark:bg-slate-950/60">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-base font-bold text-white">
              Z
            </span>
            <span className="text-slate-900 dark:text-white">Admin</span>
          </Link>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 border-t border-purple-200/70 pt-6 dark:border-white/10">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
