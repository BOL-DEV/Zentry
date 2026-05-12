"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LuMenu, LuX } from "react-icons/lu";

import PlatformBrand from "@/components/PlatformBrand";
import ThemeToggle from "@/components/ThemeToggle";
import { clearAdminAuthToken } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isJwtExpired } from "@/helpers/jwt";
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { token } = useAdminAuthSession();

  const navItems: NavItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/dashboard/admin", exact: true },
      { label: "Organizers", href: "/dashboard/admin/organizers" },
      { label: "Review Requests", href: "/dashboard/admin/organizer-requests" },
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

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const next =
      typeof window === "undefined"
        ? pathname
        : `${window.location.pathname}${window.location.search}`;

    if (!token) {
      router.replace(
        `/admin/login?next=${encodeURIComponent(next)}&reason=auth-required`,
      );
      return;
    }

    if (isJwtExpired(token)) {
      clearAdminAuthToken();
      router.replace(
        `/admin/login?next=${encodeURIComponent(next)}&reason=session-expired`,
      );
    }
  }, [pathname, router, token]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  function renderSidebar({ showClose }: { showClose: boolean }) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-3">
            <PlatformBrand
              className="flex items-center gap-2"
              logoClassName="h-10 w-10"
              textClassName="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
              text="Zentra"
              priority
            />
          </Link>

          {showClose ? (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-200/70 bg-white/90 text-slate-900 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <LuX className="text-lg" />
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          Admin
        </p>

        <nav className="mt-8 flex-1 space-y-2 overflow-y-auto pr-1">
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

        <div className="mt-6 border-t border-purple-200/70 pt-6 dark:border-white/10">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-purple-100 text-slate-900 dark:bg-slate-950/90 dark:text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-purple-200/70 bg-purple-100/70 px-6 py-7 dark:border-white/10 dark:bg-slate-950/60 md:block">
        {renderSidebar({ showClose: false })}
      </aside>

      <button
        type="button"
        aria-label="Open admin navigation"
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-200/70 bg-white/90 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/20 dark:border-white/10 dark:bg-slate-950/80 dark:text-white md:hidden"
      >
        <LuMenu className="text-lg" />
      </button>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/60"
          />

          <aside className="absolute inset-y-0 left-0 w-72 border-r border-purple-200/70 bg-purple-100 px-6 py-7 dark:border-white/10 dark:bg-slate-950">
            {renderSidebar({ showClose: true })}
          </aside>
        </div>
      ) : null}

      <div className="h-dvh overflow-y-auto pt-16 md:pt-0 md:pl-72">{children}</div>
    </div>
  );
}

export default AdminDashboardLayout;
