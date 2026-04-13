"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import MobileMenuToggle from "./MobileMenuToggle";
import ThemeToggle from "./ThemeToggle";
import { clearAdminAuthToken } from "@/helpers/admin-auth";
import { logoutAdminUser } from "@/helpers/organizer-api";

type DashboardRole = "admin" | "organizer";

interface Props {
  role: DashboardRole;
  email: string;
}

function DashboardHeader({ role, email }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuData =
    role === "admin"
      ? [
          { name: "Home", href: "/" },
          { name: "Dashboard", href: "/dashboard/admin" },
          { name: "Organizers", href: "/dashboard/admin/organizers" },
          { name: "Create User", href: "/dashboard/admin/users/create" },
          { name: "Orders", href: "/dashboard/admin/orders" },
          { name: "Events", href: "/dashboard/admin/events" },
          { name: "Tickets", href: "/dashboard/admin/tickets" },
        ]
      : [
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
        ];

  const isAdminRoute = pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/");

  return (
    <header className="fixed top-0 z-50 w-full border-b border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white">
      <div className="mx-auto flex items-center justify-between px-6 py-4 lg:max-w-7xl">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-2xl">
            ⚡
          </span>
          <span className="text-xl font-bold text-purple-600">Zentry</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center">
            <ul className="hidden list-none items-center gap-8 pr-6 text-xs font-medium uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300 lg:flex">
              {menuData.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`rounded-xl p-3 font-semibold transition hover:bg-purple-200 hover:text-purple-700 dark:hover:bg-white/5 dark:hover:text-white ${
                        active ? "bg-purple-200 text-purple-700 dark:bg-white/10 dark:text-white" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="hidden items-center gap-4 border-l border-purple-200/70 pl-4 pr-4 dark:border-white/10 lg:flex">
              <span className="max-w-55 truncate text-sm text-slate-600 dark:text-slate-300">
                {email}
              </span>

              {isAdminRoute ? (
                <button
                  type="button"
                  onClick={async () => {
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
                  }}
                  disabled={isLoggingOut}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              ) : (
                <Link
                  href="/"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700"
                >
                  Logout
                </Link>
              )}
            </div>

            <ThemeToggle />
            <MobileMenuToggle menuData={menuData} />
          </nav>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
