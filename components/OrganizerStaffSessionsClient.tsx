"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuLaptop, LuLogOut, LuRefreshCw, LuShieldCheck, LuSmartphone } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
import { formatDateTimeText } from "@/helpers/date";
import {
  getStaffSessions,
  logoutAllStaffSessions,
  logoutStaffSession,
} from "@/helpers/organizer-api";

function formatSessionDate(value?: string) {
  if (!value) return "Unavailable";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unavailable";
  return formatDateTimeText(parsed, { month: "short" });
}

function getDeviceIcon(deviceName?: string) {
  const label = deviceName?.toLowerCase() || "";
  if (
    label.includes("phone") ||
    label.includes("android") ||
    label.includes("iphone") ||
    label.includes("mobile")
  ) {
    return <LuSmartphone className="text-lg" />;
  }

  return <LuLaptop className="text-lg" />;
}

function OrganizerStaffSessionsClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { token, user: authUser } = useAuthSession();
  const [staffIdInput, setStaffIdInput] = useState(searchParams.get("staffId") || "");
  const [activeStaffId, setActiveStaffId] = useState(searchParams.get("staffId") || "");

  useEffect(() => {
    if (!token) {
      router.replace(
        `/login?next=/${organizer}/dashboard/staff-sessions&reason=auth-required`,
      );
    }
  }, [organizer, router, token]);

  const sessionsQuery = useQuery({
    queryKey: ["organizer-staff-sessions", organizer, activeStaffId],
    queryFn: () => getStaffSessions(activeStaffId),
    enabled: Boolean(token) && authUser?.role !== "staff" && Boolean(activeStaffId),
    retry: false,
  });

  useEffect(() => {
    if (!isAuthIssue(sessionsQuery.error)) return;

    clearAuthToken();
    router.replace(
      `/login?next=/${organizer}/dashboard/staff-sessions&reason=session-expired`,
    );
  }, [organizer, router, sessionsQuery.error]);

  const logoutOneMutation = useMutation({
    mutationFn: ({ staffId, sessionId }: { staffId: string; sessionId: string }) =>
      logoutStaffSession(staffId, sessionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["organizer-staff-sessions", organizer, activeStaffId],
      });
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: (staffId: string) => logoutAllStaffSessions(staffId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["organizer-staff-sessions", organizer, activeStaffId],
      });
    },
  });

  const sessions = useMemo(
    () => sessionsQuery.data?.sessions ?? [],
    [sessionsQuery.data?.sessions],
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
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Staff accounts can use the check-in workspace, but only organizer accounts can manage staff sessions.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Staff Sessions"
          title="Manage staff logins"
          description="Look up a staff member by ID, review active devices, and revoke one device or all sessions."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
        />

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <input
              value={staffIdInput}
              onChange={(event) => setStaffIdInput(event.target.value)}
              placeholder="Enter staff ID"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setActiveStaffId(staffIdInput.trim())}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Load Sessions
            </button>
            <button
              type="button"
              onClick={() => void sessionsQuery.refetch()}
              disabled={!activeStaffId || sessionsQuery.isFetching}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <LuRefreshCw className="text-base" />
              Refresh
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Use the staff user ID returned when staff accounts are created to review and revoke active staff devices.
          </p>
        </section>

        {!activeStaffId ? (
          <div className="mt-8">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Enter a staff ID to view active sessions.
              </p>
            </Card>
          </div>
        ) : sessionsQuery.isLoading ? (
          <div className="mt-8">
            <FullPageLoader
              title="Loading staff sessions"
              description="We are checking active devices for this staff member."
            />
          </div>
        ) : sessionsQuery.error ? (
          <div className="mt-8">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {sessionsQuery.error instanceof Error
                  ? sessionsQuery.error.message
                  : "We couldn't load staff sessions right now."}
              </p>
            </Card>
          </div>
        ) : (
          <>
            <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Active Sessions
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {sessions.length} device{sessions.length === 1 ? "" : "s"} currently active for this staff member.
                </p>
              </div>

              <button
                type="button"
                onClick={() => logoutAllMutation.mutate(activeStaffId)}
                disabled={logoutAllMutation.isPending || !sessions.length}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
              >
                <LuLogOut className="text-base" />
                {logoutAllMutation.isPending ? "Logging Out..." : "Logout All Devices"}
              </button>
            </section>

            {logoutAllMutation.isError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {logoutAllMutation.error instanceof Error
                  ? logoutAllMutation.error.message
                  : "We couldn't revoke all staff sessions right now."}
              </div>
            ) : null}

            <section className="mt-6 space-y-4">
              {sessions.length ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                            {getDeviceIcon(session.deviceName)}
                          </span>
                          <div>
                            <p className="font-semibold">
                              {session.deviceName || "Unknown device"}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Session ID: {session.id}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70">
                            <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                              LAST ACTIVITY
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                              {formatSessionDate(session.lastActivityAt)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70">
                            <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                              USER AGENT / IP
                            </p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">
                              {session.userAgent || session.ipAddress || "Unavailable"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          logoutOneMutation.mutate({
                            staffId: activeStaffId,
                            sessionId: session.id,
                          })
                        }
                        disabled={logoutOneMutation.isPending}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-70 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
                      >
                        <LuShieldCheck className="text-base" />
                        Revoke Device
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <Card>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No active sessions were returned for this staff member.
                  </p>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default OrganizerStaffSessionsClient;
