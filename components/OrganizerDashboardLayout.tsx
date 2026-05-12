"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import {
  LuCalendarDays,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuHouse,
  LuImage,
  LuKeyRound,
  LuLogOut,
  LuMenu,
  LuPlus,
  LuSettings2,
  LuSquarePen,
  LuTicket,
  LuUsers,
  LuX,
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

const DESKTOP_SIDEBAR_STORAGE_KEY = "organizer-dashboard-sidebar-collapsed";

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = window.localStorage.getItem(
      DESKTOP_SIDEBAR_STORAGE_KEY,
    );
    setIsSidebarCollapsed(storedValue === "true");
  }, []);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsAccountMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  if (user?.role === "staff") {
    return <>{children}</>;
  }

  function toggleDesktopSidebar() {
    setIsSidebarCollapsed((current) => {
      const nextValue = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          DESKTOP_SIDEBAR_STORAGE_KEY,
          String(nextValue),
        );
      }
      return nextValue;
    });
  }

  async function handleLogout() {
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
      setIsMobileSidebarOpen(false);
    }
  }

  function renderSidebarNav(compact = false) {
    return (
      <>
        <nav className="mt-5 flex-1 space-y-2 overflow-y-auto pr-1">
          {primaryItems.map((item) => {
            const active = isActivePath(pathname, item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={compact ? item.label : undefined}
                className={`flex items-center rounded-2xl text-sm font-medium transition ${
                  compact
                    ? `justify-center px-3 py-3 ${
                        active
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                      }`
                    : `gap-3 px-4 py-3 ${
                        active
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                      }`
                }`}
              >
                {item.icon}
                {compact ? null : <span>{item.label}</span>}
              </Link>
            );
          })}

          {groups.map((group) => {
            const hasActiveChild = group.items.some((item) =>
              isActivePath(pathname, item.href),
            );
            const open = openGroups[group.key] ?? hasActiveChild;

            if (compact) {
              const activeItem = group.items.find((item) =>
                isActivePath(pathname, item.href),
              );

              return (
                <Link
                  key={group.key}
                  href={activeItem?.href ?? group.items[0]?.href ?? dashboardRoot}
                  title={group.label}
                  className={`flex items-center justify-center rounded-2xl px-3 py-3 text-sm transition ${
                    hasActiveChild
                      ? "bg-purple-50 text-purple-700 dark:bg-white/10 dark:text-white"
                      : "text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {group.icon}
                </Link>
              );
            }

            return (
              <div
                key={group.key}
                className="rounded-2xl p-2"
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

        {compact ? null : (
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
        )}
      </>
    );
  }

  function renderAccountSection(compact = false) {
    if (compact) {
      return (
        <div className="mt-5 flex items-end justify-between gap-2 px-1 py-2 lg:mt-auto">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            <ThemeToggle />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Link
              href={`${dashboardRoot}/password`}
              title="Change Password"
              className={`flex items-center justify-center rounded-2xl px-3 py-3 text-sm transition ${
                isActivePath(pathname, `${dashboardRoot}/password`)
                  ? "bg-purple-50 text-purple-700 dark:bg-white/10 dark:text-white"
                  : "text-slate-700 hover:bg-purple-50 hover:text-purple-700 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <LuKeyRound className="text-base" />
            </Link>
            <button
              type="button"
              title={isLoggingOut ? "Logging out..." : "Logout"}
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="flex items-center justify-center rounded-2xl px-3 py-3 text-sm text-rose-700 transition hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-500/10"
            >
              <LuLogOut className="text-base" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-5 px-1 py-2 lg:mt-auto">
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((current) => !current)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl px-1 py-1 text-left transition"
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
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            <ThemeToggle />
          </div>
        </div>

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
              onClick={handleLogout}
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
    );
  }

  return (
    <div
      className={`min-h-screen bg-purple-100 dark:bg-slate-950/90 lg:grid ${
        isSidebarCollapsed
          ? "lg:grid-cols-[104px_minmax(0,1fr)]"
          : "lg:grid-cols-[288px_minmax(0,1fr)]"
      }`}
    >
      <aside
        className={`hidden border-r border-white/10 bg-white/90 backdrop-blur-sm dark:bg-slate-950/95 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col ${
          isSidebarCollapsed ? "lg:px-3 lg:py-5" : "lg:px-5 lg:py-5"
        }`}
      >
        <div
          className={`flex items-center rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 ${
            isSidebarCollapsed
              ? "justify-center px-3 py-4"
              : "justify-between gap-3 px-4 py-4"
          }`}
        >
          <Link href={dashboardRoot} className="min-w-0">
            {isSidebarCollapsed ? (
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-sm font-bold text-white">
                {(organizer || "O").trim().charAt(0).toUpperCase()}
              </span>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-purple-700 dark:text-purple-300">
                  Zentra
                </p>
                <p className="mt-2 truncate text-lg font-semibold text-slate-900 dark:text-white">
                  {organizer || "Organizer"}
                </p>
              </>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleDesktopSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <LuChevronLeft
              className={`text-base transition ${isSidebarCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {renderSidebarNav(isSidebarCollapsed)}
        {renderAccountSection(isSidebarCollapsed)}
      </aside>

      <div className="min-w-0 overflow-x-hidden">
        <div>
          <div className="border-b border-purple-200/70 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuMenu className="text-base" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {user?.fullName || organizer || "Organizer Workspace"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Organizer Workspace
                </p>
              </div>
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
                  onClick={handleLogout}
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

        {isMobileSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden pointer-events-none">
            <button
              type="button"
              aria-label="Close sidebar overlay"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] pointer-events-auto"
            />

            <aside className="relative z-10 flex h-full w-[min(82vw,320px)] max-w-[calc(100vw-1.5rem)] flex-col overflow-y-auto border-r border-white/10 bg-white/95 px-4 py-5 shadow-2xl dark:bg-slate-950/98 pointer-events-auto">
              <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <Link href={dashboardRoot} className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-purple-700 dark:text-purple-300">
                    Zentra
                  </p>
                  <p className="mt-2 truncate text-lg font-semibold text-slate-900 dark:text-white">
                    {organizer || "Organizer"}
                  </p>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <LuX className="text-base" />
                </button>
              </div>

              {renderSidebarNav(false)}
              {renderAccountSection(false)}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default OrganizerDashboardLayout;
