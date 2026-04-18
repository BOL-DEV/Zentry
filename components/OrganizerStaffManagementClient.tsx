"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LuCircleCheck,
  LuLaptop,
  LuShield,
  LuUserRound,
  LuUsers,
} from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
import { formatDateTimeText } from "@/helpers/date";
import { getOrganizerDashboardUsers } from "@/helpers/organizer-api";

function formatJoinedDate(value?: string) {
  if (!value) return "Unavailable";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unavailable";
  return formatDateTimeText(parsed, { month: "short" });
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {helper}
          </p>
        </div>

        <div className="text-purple-700 dark:text-purple-300">{icon}</div>
      </div>
    </div>
  );
}

function OrganizerStaffManagementClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const { token, user: authUser } = useAuthSession();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["organizer-dashboard-users", organizer],
    queryFn: getOrganizerDashboardUsers,
    enabled: Boolean(token) && authUser?.role !== "staff",
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/login?next=/${organizer}/dashboard/staff&reason=auth-required`);
    }
  }, [organizer, router, token]);

  useEffect(() => {
    if (!isAuthIssue(error)) return;

    clearAuthToken();
    router.replace(`/login?next=/${organizer}/dashboard/staff&reason=session-expired`);
  }, [error, organizer, router]);

  const users = useMemo(() => data?.users ?? [], [data?.users]);
  const organizerAccounts = useMemo(
    () => users.filter((entry) => entry.role === "organizer"),
    [users],
  );
  const staffAccounts = useMemo(
    () => users.filter((entry) => entry.role === "staff"),
    [users],
  );
  const activeStaffAccounts = useMemo(
    () => staffAccounts.filter((entry) => entry.isActive),
    [staffAccounts],
  );

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to login"
        description="Taking you back to sign in."
      />
    );
  }

  if (authUser?.role === "staff") {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Staff accounts can use the check-in workspace, but only organizer accounts can manage team access.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <FullPageLoader
        title="Loading staff management"
        description="Pulling organizer and staff access details."
      />
    );
  }

  if (error) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error instanceof Error
                ? error.message
                : "We couldn't load staff management right now."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Staff Management"
          title="Manage your event team."
          description="Open each staff member's security view from here."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
        />

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <SummaryCard
            label="Organizer Accounts"
            value={String(organizerAccounts.length)}
            helper="Dashboard owners with full organizer access"
            icon={<LuShield size={22} />}
          />
          <SummaryCard
            label="Staff Accounts"
            value={String(staffAccounts.length)}
            helper="Check-in focused accounts connected to this organizer"
            icon={<LuUsers size={22} />}
          />
          <SummaryCard
            label="Active Staff"
            value={String(activeStaffAccounts.length)}
            helper="Staff accounts currently marked active by the backend"
            icon={<LuCircleCheck size={22} />}
          />
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dashboard Access
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {users.length ? (
              users.map((entry) => {
                const isStaff = entry.role === "staff";
                const statusTone = entry.isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300";

                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                            {isStaff ? <LuUsers className="text-lg" /> : <LuUserRound className="text-lg" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold">{entry.fullName}</p>
                            <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                              {entry.email}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                          <span className="rounded-full bg-white px-3 py-1 dark:bg-white/10">
                            {entry.role}
                          </span>
                          <span className={`rounded-full px-3 py-1 ${statusTone}`}>
                            {entry.isActive ? "active" : "inactive"}
                          </span>
                          <span>Joined {formatJoinedDate(entry.createdAt)}</span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-white p-4 dark:bg-white/5">
                            <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                              LAST UPDATED
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                              {formatJoinedDate(entry.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-auto lg:min-w-[230px]">
                        {isStaff ? (
                          <Link
                            href={`/${organizer}/dashboard/staff-sessions?staffId=${encodeURIComponent(entry.id)}`}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
                          >
                            <LuLaptop className="text-base" />
                            Open Staff Security
                          </Link>
                        ) : (
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                            Organizer password changes stay in profile settings.
                          </div>
                        )}

                        {isStaff ? null : (
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                            Organizer accounts do not use staff device controls.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                No dashboard users were returned for this organizer yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrganizerStaffManagementClient;
