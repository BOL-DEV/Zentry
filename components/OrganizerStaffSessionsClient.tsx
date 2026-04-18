"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LuLaptop,
  LuLogOut,
  LuRefreshCw,
  LuShieldCheck,
  LuSmartphone,
  LuUserRound,
} from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
import { formatDateTimeText } from "@/helpers/date";
import {
  getOrganizerDashboardStaff,
  getStaffSessions,
  logoutAllStaffSessions,
  logoutStaffSession,
  resetOrganizerStaffPassword,
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
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  function applyStaffSelection(nextStaffId: string) {
    const trimmedStaffId = nextStaffId.trim();
    setMessage(null);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setStaffIdInput(trimmedStaffId);
    setActiveStaffId(trimmedStaffId);
    router.replace(
      trimmedStaffId
        ? `/${organizer}/dashboard/staff-sessions?staffId=${encodeURIComponent(trimmedStaffId)}`
        : `/${organizer}/dashboard/staff-sessions`,
    );
  }

  useEffect(() => {
    if (!token) {
      router.replace(
        `/login?next=/${organizer}/dashboard/staff-sessions&reason=auth-required`,
      );
    }
  }, [organizer, router, token]);

  const staffQuery = useQuery({
    queryKey: ["organizer-dashboard-staff", organizer],
    queryFn: getOrganizerDashboardStaff,
    enabled: Boolean(token) && authUser?.role !== "staff",
    retry: false,
  });

  const sessionsQuery = useQuery({
    queryKey: ["organizer-staff-sessions", organizer, activeStaffId],
    queryFn: () => getStaffSessions(activeStaffId),
    enabled: Boolean(token) && authUser?.role !== "staff" && Boolean(activeStaffId),
    retry: false,
  });

  useEffect(() => {
    if (!isAuthIssue(staffQuery.error) && !isAuthIssue(sessionsQuery.error)) return;

    clearAuthToken();
    router.replace(
      `/login?next=/${organizer}/dashboard/staff-sessions&reason=session-expired`,
    );
  }, [organizer, router, sessionsQuery.error, staffQuery.error]);

  const logoutOneMutation = useMutation({
    mutationFn: ({ staffId, sessionId }: { staffId: string; sessionId: string }) =>
      logoutStaffSession(staffId, sessionId),
    onSuccess: async () => {
      setMessage({
        type: "success",
        text: "Staff device revoked successfully.",
      });
      await queryClient.invalidateQueries({
        queryKey: ["organizer-staff-sessions", organizer, activeStaffId],
      });
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't revoke that device right now.",
      });
    },
  });

  const logoutAllMutation = useMutation({
    mutationFn: (staffId: string) => logoutAllStaffSessions(staffId),
    onSuccess: async () => {
      setMessage({
        type: "success",
        text: "All active staff devices were revoked successfully.",
      });
      await queryClient.invalidateQueries({
        queryKey: ["organizer-staff-sessions", organizer, activeStaffId],
      });
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't revoke all staff sessions right now.",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (staffId: string) =>
      resetOrganizerStaffPassword(staffId, {
        newPassword: passwordForm.newPassword,
      }),
    onSuccess: async () => {
      setMessage({
        type: "success",
        text: "Staff password updated successfully.",
      });
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      await queryClient.invalidateQueries({
        queryKey: ["organizer-dashboard-staff", organizer],
      });
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't reset that staff password right now.",
      });
    },
  });

  const sessions = useMemo(
    () => sessionsQuery.data?.sessions ?? [],
    [sessionsQuery.data?.sessions],
  );
  const staffMembers = useMemo(
    () => staffQuery.data?.staff ?? [],
    [staffQuery.data?.staff],
  );
  const activeStaff = useMemo(
    () => staffMembers.find((staff) => staff.id === activeStaffId) ?? null,
    [activeStaffId, staffMembers],
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
          eyebrow="Staff Security"
          title="Manage staff access"
          description="Pick a staff account, reset that password, and review active devices from one security screen."
          backHref={`/${organizer}/dashboard/staff`}
          backLabel="Back to Staff Management"
        />

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Staff directory
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Select a staff member from the organizer dashboard users returned by the backend to open their dedicated security view.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  void staffQuery.refetch();
                  if (activeStaffId) {
                    void sessionsQuery.refetch();
                  }
                }}
                disabled={staffQuery.isFetching || sessionsQuery.isFetching}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <LuRefreshCw className="text-base" />
                Refresh
              </button>
            </div>

            {staffQuery.isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                Loading staff accounts...
              </div>
            ) : staffQuery.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {staffQuery.error instanceof Error
                  ? staffQuery.error.message
                  : "We couldn't load staff accounts right now."}
              </div>
            ) : staffMembers.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {staffMembers.map((staff) => {
                  const isSelected = staff.id === activeStaffId;

                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => applyStaffSelection(staff.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 shadow-sm dark:border-purple-400 dark:bg-purple-500/10"
                          : "border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-purple-50/60 dark:border-white/10 dark:bg-slate-900/50 dark:hover:border-purple-500/40 dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <LuUserRound className="text-base" />
                            <p className="truncate font-semibold">{staff.fullName}</p>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
                            {staff.email}
                          </p>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            Staff ID: {staff.id}
                          </p>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-white text-slate-700 dark:bg-white/10 dark:text-slate-200"
                          }`}
                        >
                          {isSelected ? "Viewing" : "Open"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
                No staff accounts have been created yet. Create one from the admin user flow, then return here to manage active devices.
              </div>
            )}

            <div className="grid gap-3 border-t border-slate-200 pt-4 dark:border-white/10 md:grid-cols-[1fr_auto]">
              <input
                value={staffIdInput}
                onChange={(event) => setStaffIdInput(event.target.value)}
                placeholder="Or paste a staff ID"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <button
                type="button"
                onClick={() => applyStaffSelection(staffIdInput)}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Load by ID
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Direct links with `staffId` still work, so you can bookmark or share a specific staff security view when needed.
          </p>

          {message ? (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
              }`}
            >
              {message.text}
            </div>
          ) : null}
        </section>

        {!activeStaffId ? (
          <div className="mt-8">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Select a staff account above to view active sessions.
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
            <section className="mt-8">
              <Card>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Selected Staff
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {activeStaff?.fullName || "Staff member"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {activeStaff?.email || "No email available"}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Staff ID: {activeStaffId}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    Reset this staff password here, then use the device controls below to revoke specific sessions or every active login.
                  </div>
                </div>
              </Card>
            </section>

            <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Active Sessions
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {sessions.length} device{sessions.length === 1 ? "" : "s"} currently active for{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeStaff?.fullName || "this staff member"}
                  </span>
                  .
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

            <section className="mt-6">
              <Card>
                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setMessage(null);

                    if (passwordForm.newPassword.length < 8) {
                      setMessage({
                        type: "error",
                        text: "New staff password must be at least 8 characters long.",
                      });
                      return;
                    }

                    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                      setMessage({
                        type: "error",
                        text: "Staff password confirmation must match.",
                      });
                      return;
                    }

                    resetPasswordMutation.mutate(activeStaffId);
                  }}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Reset Staff Password
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Set a new password for {activeStaff?.fullName || "this staff account"} from the organizer dashboard. This maps directly to the staff password endpoint from the backend.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-white">
                        New Password
                      </span>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            newPassword: event.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        required
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-white">
                        Confirm Password
                      </span>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        required
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    {resetPasswordMutation.isPending ? "Updating Password..." : "Reset Password"}
                  </button>
                </form>
              </Card>
            </section>

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
