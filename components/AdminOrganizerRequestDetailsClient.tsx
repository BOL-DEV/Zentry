"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowLeft, LuArrowUpRight, LuCheck, LuMail, LuMapPin, LuPhone, LuX } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import {
  approveAdminOrganizerRequest,
  getAdminOrganizerRequestDetail,
  getAdminProfile,
  rejectAdminOrganizerRequest,
} from "@/helpers/organizer-api";

function formatDateTime(value?: string | null) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

type Props = { requestId: string };

function AdminOrganizerRequestDetailsClient({ requestId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user } = useAdminAuthSession();
  const [reviewNote, setReviewNote] = useState("");

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const requestQuery = useQuery({
    queryKey: ["admin-organizer-request", requestId],
    queryFn: () => getAdminOrganizerRequestDetail(requestId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      approveAdminOrganizerRequest(requestId, {
        reviewNote: reviewNote.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-organizer-request", requestId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-organizer-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-organizers"] }),
      ]);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      rejectAdminOrganizerRequest(requestId, {
        reviewNote: reviewNote.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-organizer-request", requestId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-organizer-requests"] }),
      ]);
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/organizer-requests/${requestId}`)}&reason=auth-required`);
    }
  }, [requestId, router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;

    clearAdminAuthToken();
    router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/organizer-requests/${requestId}`)}&reason=session-expired`);
  }, [profileQuery.error, profileQuery.isFetching, requestId, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to admin login"
        description="Taking you to the secure admin sign-in page."
      />
    );
  }

  if (profileQuery.isLoading || profileQuery.isFetching || requestQuery.isLoading) {
    return (
      <FullPageLoader
        title="Loading organizer request"
        description="Pulling request details, notes, and approval state."
      />
    );
  }

  if (profileQuery.error || requestQuery.error || !profileQuery.data?.admin || !requestQuery.data) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : requestQuery.error instanceof Error
          ? requestQuery.error.message
          : "We couldn't load this organizer request right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader
          role="admin"
          email={profileQuery.data?.admin.email || user?.email || "Platform workspace"}
        />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const request = requestQuery.data;
  const createdOrganizerId =
    approveMutation.data?.organizer.id || request.createdOrganizerId || "";
  const actionMessage =
    approveMutation.isSuccess && approveMutation.data
      ? `Approved. Temporary password: ${approveMutation.data.temporaryPassword}`
      : rejectMutation.isSuccess
        ? "Request rejected successfully."
        : null;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader
        role="admin"
        email={profileQuery.data.admin.email || user?.email || "Platform workspace"}
      />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/dashboard/admin/organizer-requests"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
          >
            <LuArrowLeft className="text-base" />
            Back to organizer requests
          </Link>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
                Organizer Request
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                {request.name}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                {request.email}
              </p>
            </div>

            <div className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:border dark:border-cyan-400/10 dark:bg-[#081427] dark:text-cyan-100">
              {request.status}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,20,39,0.96),rgba(4,11,23,0.98))]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Request Details
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                    <LuMail className="text-base text-purple-600 dark:text-cyan-300" />
                    {request.email}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                    <LuPhone className="text-base text-purple-600 dark:text-cyan-300" />
                    {request.phone || "No phone provided"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 md:col-span-2 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                    <LuMapPin className="text-base text-purple-600 dark:text-cyan-300" />
                    {request.location || "No location provided"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 md:col-span-2 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    About
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {request.about || "No organizer summary provided."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 md:col-span-2 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Hero Copy
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {request.heroTitle || "No hero title provided"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {request.heroSubtitle || "No hero subtitle provided."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Logo URL
                  </p>
                  {request.logoUrl ? (
                    <a
                      href={request.logoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 break-all text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                      {request.logoUrl}
                      <LuArrowUpRight className="text-base" />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No logo supplied.</p>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Banner URL
                  </p>
                  {request.bannerUrl ? (
                    <a
                      href={request.bannerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 break-all text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                      {request.bannerUrl}
                      <LuArrowUpRight className="text-base" />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No banner supplied.</p>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 md:col-span-2 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Bank Details
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-950 dark:text-white">Bank:</span>{" "}
                      {request.bankDetails?.bankName || "Not provided"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-950 dark:text-white">Code:</span>{" "}
                      {request.bankDetails?.bankCode || "Not provided"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-950 dark:text-white">Account No:</span>{" "}
                      {request.bankDetails?.accountNumber || "Not provided"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-950 dark:text-white">Account Name:</span>{" "}
                      {request.bankDetails?.accountName || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,20,39,0.96),rgba(4,11,23,0.98))]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Review Metadata
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Preferred Slug
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {request.preferredSlug || "No preferred slug"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Submitted
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {formatDateTime(request.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Approved At
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {formatDateTime(request.approvedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Rejected At
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {formatDateTime(request.rejectedAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Created Organizer
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-950 dark:text-white">
                    {request.createdOrganizerId || "Not created"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Dashboard User
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-950 dark:text-white">
                    {request.createdDashboardUserId || "Not created"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 md:col-span-2 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Review Note
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {request.reviewNote || "No review note yet."}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,20,39,0.96),rgba(4,11,23,0.98))]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Admin Decision
              </p>

              <div className="mt-5 space-y-4">
                <textarea
                  rows={6}
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Add an approval or rejection note"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-cyan-400/10 dark:bg-[#0b1628] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-300 dark:focus:ring-cyan-400/15"
                />

                {actionMessage ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {actionMessage}
                  </div>
                ) : null}

                {approveMutation.isError || rejectMutation.isError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                    {approveMutation.error instanceof Error
                      ? approveMutation.error.message
                      : rejectMutation.error instanceof Error
                        ? rejectMutation.error.message
                        : "We couldn't update this organizer request right now."}
                  </div>
                ) : null}

                {request.status === "pending" ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => approveMutation.mutate()}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
                    >
                      <LuCheck className="text-base" />
                      {approveMutation.isPending ? "Approving..." : "Approve Request"}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectMutation.mutate()}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
                    >
                      <LuX className="text-base" />
                      {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
                    </button>
                  </div>
                ) : null}
              </div>
            </Card>

            {createdOrganizerId ? (
              <Card className="border-slate-200/80 bg-white/90 dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,20,39,0.96),rgba(4,11,23,0.98))]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Created Records
                </p>
                <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      Organizer
                    </p>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      {approveMutation.data?.organizer.name || request.name}
                      {approveMutation.data?.organizer.slug
                        ? ` | @${approveMutation.data.organizer.slug}`
                        : ""}
                    </p>
                    <Link
                      href={`/dashboard/admin/organizers/${createdOrganizerId}`}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                      Open organizer
                      <LuArrowUpRight className="text-base" />
                    </Link>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-cyan-400/10 dark:bg-[#0b1628]">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      Dashboard user
                    </p>
                    <p className="mt-2 break-all text-slate-600 dark:text-slate-300">
                      {approveMutation.data?.dashboardUser.email || request.email}
                    </p>
                    <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                      {approveMutation.data?.dashboardUser.id ||
                        request.createdDashboardUserId ||
                        "Dashboard user ID unavailable"}
                    </p>
                  </div>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminOrganizerRequestDetailsClient;
