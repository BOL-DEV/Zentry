"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowLeft, LuCalendarDays } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { getAdminEventDetail, getAdminProfile, updateAdminEvent } from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const textAreaStyles =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

function toDateTimeLocal(isoValue?: string) {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

type Props = {
  eventId: string;
};

function AdminEditEventClient({ eventId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user } = useAdminAuthSession();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    posterUrl: "",
    dressCode: "",
    policies: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const eventQuery = useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: () => getAdminEventDetail(eventId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace(
        `/admin/login?next=${encodeURIComponent(`/dashboard/admin/events/${eventId}/edit`)}&reason=auth-required`,
      );
    }
  }, [eventId, router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;
    clearAdminAuthToken();
    router.replace(
      `/admin/login?next=${encodeURIComponent(`/dashboard/admin/events/${eventId}/edit`)}&reason=session-expired`,
    );
  }, [eventId, profileQuery.error, profileQuery.isFetching, router]);

  useEffect(() => {
    if (!eventQuery.data?.event) return;
    const event = eventQuery.data.event;
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: toDateTimeLocal(event.date),
      location: event.location || "",
      posterUrl: event.posterUrl || "",
      dressCode: event.dressCode || "",
      policies: event.policies || "",
    });
  }, [eventQuery.data]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const updatedEvent = await updateAdminEvent(eventId, {
        title: form.title,
        description: form.description,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        location: form.location,
        posterUrl: form.posterUrl,
        dressCode: form.dressCode,
        policies: form.policies,
      });

      void queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] });
      void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setSuccess(`Saved updates for ${updatedEvent.title}.`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to update event right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching || eventQuery.isLoading) {
    return <FullPageLoader title="Loading event editor" description="Preparing event data and update controls." />;
  }

  if (profileQuery.error || eventQuery.error || !profileQuery.data?.admin || !eventQuery.data) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : eventQuery.error instanceof Error
          ? eventQuery.error.message
          : "We couldn't open the event editor right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader role="admin" email={user?.email || "Platform workspace"} />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader role="admin" email={profileQuery.data.admin.email || user?.email || "Platform workspace"} />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href={`/dashboard/admin/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
          >
            <LuArrowLeft className="text-base" />
            Back to event
          </Link>
          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
              Edit Event
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Update event content and poster details.
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                <LuCalendarDays className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Event Update
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  Event details
                </h2>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Title</label>
                  <input className={inputStyles} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Date</label>
                  <input type="datetime-local" className={inputStyles} value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Location</label>
                  <input className={inputStyles} value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Poster URL</label>
                  <input className={inputStyles} value={form.posterUrl} onChange={(event) => setForm((current) => ({ ...current, posterUrl: event.target.value }))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Description</label>
                  <textarea rows={5} className={textAreaStyles} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Dress Code</label>
                  <input className={inputStyles} value={form.dressCode} onChange={(event) => setForm((current) => ({ ...current, dressCode: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Policies</label>
                  <input className={inputStyles} value={form.policies} onChange={(event) => setForm((current) => ({ ...current, policies: event.target.value }))} />
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving changes..." : "Save Event Changes"}
              </button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default AdminEditEventClient;
