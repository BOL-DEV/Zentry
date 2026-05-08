"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import {
  LuCalendarDays,
  LuChevronDown,
  LuChevronRight,
  LuHouse,
  LuImage,
  LuKeyRound,
  LuLogOut,
  LuPlus,
  LuSettings2,
  LuSquarePen,
  LuTicket,
  LuUsers,
} from "react-icons/lu";

import ThemeToggle from "@/components/ThemeToggle";
import { clearAuthToken } from "@/helpers/auth";
import { useAuthSession } from "@/helpers/auth-client";
import { logoutDashboardUser } from "@/helpers/organizer-api";

type Props = {
  children: React.ReactNode;
};

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

type SidebarGroup = {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: Array<{
    label: string;
    href: string;
  }>;
};

function isActivePath(pathname: string, href: string, exact = false) {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function OrganizerDashboardLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ organizer?: string }>();
  const { user } = useAuthSession();
  const organizer = params?.organizer ?? "";
  const dashboardRoot = `/${organizer}/dashboard`;
  const publicRoot = `/${organizer}`;

  const primaryItems: SidebarItem[] = [
    {
      label: "Dashboard",
      href: dashboardRoot,
      icon: <LuHouse className="text-base" />,
      exact: true,
    },
    {
      label: "Attendees",
      href: `${dashboardRoot}/attendees`,
      icon: <LuUsers className="text-base" />,
    },
    {
      label: "Staff Management",
      href: `${dashboardRoot}/staff`,
      icon: <LuSettings2 className="text-base" />,
    },
    {
      label: "Edit Profile",
      href: `${dashboardRoot}/profile`,
      icon: <LuSquarePen className="text-base" />,
    },
  ];

  const groups: SidebarGroup[] = useMemo(
    () => [
      {
        key: "events",
        label: "Events",
        icon: <LuCalendarDays className="text-base" />,
        items: [
          { label: "Create Event", href: `${dashboardRoot}/create` },
          { label: "Manage Events", href: `${dashboardRoot}/events` },
        ],
      },
      {
        key: "gallery",
        label: "Gallery",
        icon: <LuImage className="text-base" />,
        items: [
          { label: "Add to Gallery", href: `${dashboardRoot}/gallery/create` },
          { label: "Manage Gallery", href: `${dashboardRoot}/gallery` },
        ],
      },
    ],
    [dashboardRoot],
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (user?.role === "staff") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-purple-100 dark:bg-slate-950/90 lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
      <aside className="border-b border-purple-200/70 bg-white/90 px-4 py-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/95 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Link href={dashboardRoot} className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-purple-700 dark:text-purple-300">
              Zentra
            </p>
            <p className="mt-2 truncate text-lg font-semibold text-slate-900 dark:text-white">
              {organizer || "Organizer"}
            </p>
          </Link>

          <div className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-1 dark:border-white/10 dark:bg-white/5">
            <ThemeToggle />
          </div>
        </div>

        <nav className="mt-5 space-y-2">
          {primaryItems.map((item) => {
            const active = isActivePath(pathname, item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {groups.map((group) => {
            const hasActiveChild = group.items.some((item) =>
              isActivePath(pathname, item.href),
            );
            const open = openGroups[group.key] ?? hasActiveChild;

            return (
              <div
                key={group.key}
                className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((current) => ({
                      ...current,
                      [group.key]: !open,
                    }))
                  }
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-purple-50 dark:text-slate-200 dark:hover:bg-white/5"
                  aria-expanded={open}
                  aria-controls={`sidebar-group-${group.key}`}
                >
                  <div className="flex items-center gap-3">
                    {group.icon}
                    <span>{group.label}</span>
                  </div>
                  {open ? (
                    <LuChevronDown className="text-sm text-slate-400 dark:text-slate-400" />
                  ) : (
                    <LuChevronRight className="text-sm text-slate-400 dark:text-slate-400" />
                  )}
                </button>

                {open ? (
                  <div
                    id={`sidebar-group-${group.key}`}
                    className="space-y-1 pt-1"
                  >
                    {group.items.map((item, index) => {
                      const active = isActivePath(pathname, item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                            active
                              ? "bg-purple-50 text-purple-700 dark:bg-white/10 dark:text-white"
                              : "text-slate-600 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                          }`}
                        >
                          {index === 0 ? (
                            <LuPlus className="text-sm" />
                          ) : (
                            <LuTicket className="text-sm" />
                          )}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="mt-5 rounded-3xl border border-purple-200/70 bg-purple-50 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-purple-700 dark:text-purple-300">
            Workspace
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Manage events, gallery updates, attendees, and team access from one organizer view.
          </p>
          <Link
            href={publicRoot}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
          >
            View public page
            <LuChevronRight className="text-sm" />
          </Link>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 lg:mt-auto">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl px-1 py-1 text-left transition"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-sm font-bold text-white">
                {(user?.fullName || organizer || "O").trim().charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.fullName || "Organizer"}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  Organizer
                </span>
              </span>
            </span>
            <LuChevronDown
              className={`shrink-0 text-sm text-slate-500 transition dark:text-slate-400 ${
                isAccountMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isAccountMenuOpen ? (
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 dark:border-white/10">
              <Link
                href={`${dashboardRoot}/password`}
                onClick={() => setIsAccountMenuOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${
                  isActivePath(pathname, `${dashboardRoot}/password`)
                    ? "bg-purple-50 text-purple-700 dark:bg-white/10 dark:text-white"
                    : "text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <LuKeyRound className="text-base" />
                  Change Password
                </span>
                <LuChevronRight className="text-sm" />
              </Link>

              <button
                type="button"
                disabled={isLoggingOut}
                onClick={async () => {
                  setIsLoggingOut(true);

                  try {
                    await logoutDashboardUser();
                  } catch {
                    // Clear the local session even if the backend session is already gone.
                  } finally {
                    clearAuthToken();
                    router.push(publicRoot);
                    setIsLoggingOut(false);
                    setIsAccountMenuOpen(false);
                  }
                }}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm text-rose-700 transition hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/10"
              >
                <span className="flex items-center gap-3">
                  <LuLogOut className="text-base" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
                <LuChevronRight className="text-sm" />
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="border-b border-purple-200/70 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {primaryItems.map((item) => {
              const active = isActivePath(pathname, item.href, item.exact);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-purple-600 text-white"
                      : "bg-purple-50 text-slate-700 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href={`${dashboardRoot}/password`}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                isActivePath(pathname, `${dashboardRoot}/password`)
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-slate-700 dark:bg-white/5 dark:text-slate-300"
              }`}
            >
              Password
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-1 dark:border-white/10 dark:bg-white/5">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((current) => !current)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Account
            </button>
          </div>

          {isAccountMenuOpen ? (
            <div className="mt-3 space-y-2">
              <Link
                href={`${dashboardRoot}/password`}
                onClick={() => setIsAccountMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:bg-purple-50 hover:text-purple-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <LuKeyRound className="text-base" />
                  Change Password
                </span>
                <LuChevronRight className="text-sm" />
              </Link>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={async () => {
                  setIsLoggingOut(true);

                  try {
                    await logoutDashboardUser();
                  } catch {
                    // Clear the local session even if the backend session is already gone.
                  } finally {
                    clearAuthToken();
                    router.push(publicRoot);
                    setIsLoggingOut(false);
                    setIsAccountMenuOpen(false);
                  }
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-700 shadow-sm transition hover:bg-rose-50 dark:border-rose-500/20 dark:bg-white/5 dark:text-rose-200 dark:hover:bg-rose-500/10"
              >
                <span className="flex items-center gap-3">
                  <LuLogOut className="text-base" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
                <LuChevronRight className="text-sm" />
              </button>
            </div>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  );
}

export default OrganizerDashboardLayout;
