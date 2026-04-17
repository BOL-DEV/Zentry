"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LuArrowLeft,
  LuArrowUpRight,
  LuCalendarDays,
  LuMail,
  LuMapPin,
  LuImage,
  LuPhone,
  LuPower,
  LuSave,
  LuShieldCheck,
} from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency } from "@/helpers/format";
import {
  getAdminOrganizerDetail,
  getAdminOrganizerGalleryItemsForEdit,
  getAdminProfile,
  toggleAdminOrganizerActive,
  updateAdminOrganizerGalleryItem,
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

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

type Props = {
  organizerId: string;
};

function AdminOrganizerDetailsClient({ organizerId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user } = useAdminAuthSession();
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    imageUrl: "",
    caption: "",
    altText: "",
    displayOrder: "",
  });
  const [galleryMessage, setGalleryMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const organizerQuery = useQuery({
    queryKey: ["admin-organizer", organizerId],
    queryFn: () => getAdminOrganizerDetail(organizerId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });
  const galleryQuery = useQuery({
    queryKey: ["admin-organizer-gallery", organizerId, organizerQuery.data?.organizer.slug],
    queryFn: () =>
      getAdminOrganizerGalleryItemsForEdit(
        organizerQuery.data?.organizer.slug || "",
      ),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin) && Boolean(organizerQuery.data?.organizer.slug),
    retry: false,
  });

  const toggleMutation = useMutation({
    mutationFn: () => toggleAdminOrganizerActive(organizerId),
    onSuccess: (updatedOrganizer) => {
      queryClient.setQueryData(
        ["admin-organizer", organizerId],
        (current: Awaited<ReturnType<typeof getAdminOrganizerDetail>> | undefined) =>
          current
            ? {
                ...current,
                organizer: {
                  ...current.organizer,
                  isActive: updatedOrganizer.isActive,
                },
              }
            : current,
      );

      queryClient.setQueriesData(
        { queryKey: ["admin-organizers"] },
        (current:
          | {
              organizers: Array<{
                id: string;
                isActive: boolean;
              }>;
              pagination?: unknown;
              results?: number;
            }
          | undefined) => {
          if (!current) return current;

          return {
            ...current,
            organizers: current.organizers.map((organizer) =>
              organizer.id === updatedOrganizer.id
                ? { ...organizer, isActive: updatedOrganizer.isActive }
                : organizer,
            ),
          };
        },
      );
    },
  });
  const updateGalleryMutation = useMutation({
    mutationFn: () => {
      if (!editingGalleryId) {
        throw new Error("Select a gallery item to update.");
      }

      return updateAdminOrganizerGalleryItem(organizerId, editingGalleryId, {
        imageUrl: galleryForm.imageUrl.trim(),
        caption: galleryForm.caption.trim(),
        altText: galleryForm.altText.trim(),
        displayOrder: Number(galleryForm.displayOrder || 0),
      });
    },
    onSuccess: async () => {
      setGalleryMessage({
        type: "success",
        text: "Gallery item updated successfully.",
      });
      setEditingGalleryId(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin-organizer-gallery", organizerId],
      });
    },
    onError: (error) => {
      setGalleryMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't update that gallery item.",
      });
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace(
        `/admin/login?next=${encodeURIComponent(`/dashboard/admin/organizers/${organizerId}`)}&reason=auth-required`,
      );
    }
  }, [organizerId, router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;

    clearAdminAuthToken();
    router.replace(
      `/admin/login?next=${encodeURIComponent(`/dashboard/admin/organizers/${organizerId}`)}&reason=session-expired`,
    );
  }, [organizerId, profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return (
      <FullPageLoader
        title="Redirecting to admin login"
        description="Taking you back to the secure admin sign-in flow."
      />
    );
  }

  if (
    profileQuery.isLoading ||
    profileQuery.isFetching ||
    organizerQuery.isLoading
  ) {
    return (
      <FullPageLoader
        title="Loading organizer details"
        description="Pulling organizer health, revenue stats, and recent event activity."
      />
    );
  }

  if (
    profileQuery.error ||
    organizerQuery.error ||
    !profileQuery.data?.admin ||
    !organizerQuery.data
  ) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : organizerQuery.error instanceof Error
          ? organizerQuery.error.message
          : "We couldn't load this organizer right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader
          role="admin"
          email={
            profileQuery.data?.admin.email ||
            user?.email ||
            "Platform workspace"
          }
        />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">
            {message}
          </Card>
        </div>
      </main>
    );
  }

  const { organizer, stats, recentEvents } = organizerQuery.data;
  const checkInRate =
    stats.totalTicketsSold > 0
      ? Math.round((stats.totalCheckedInTickets / stats.totalTicketsSold) * 100)
      : 0;

  function startEditingGalleryItem(galleryItemId: string) {
    const item = galleryQuery.data?.find((entry) => entry._id === galleryItemId);

    if (!item) {
      setGalleryMessage({
        type: "error",
        text: "We couldn't load that gallery item for editing.",
      });
      return;
    }

    setEditingGalleryId(galleryItemId);
    setGalleryForm({
      imageUrl: item.imageUrl || "",
      caption: item.caption || "",
      altText: item.altText || "",
      displayOrder: String(item.displayOrder ?? 0),
    });
    setGalleryMessage(null);
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader
        role="admin"
        email={
          profileQuery.data.admin.email || user?.email || "Platform workspace"
        }
      />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
              >
                <LuArrowLeft className="text-base" />
                Back to admin overview
              </Link>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
                Organizer Control
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                  {organizer.name}
                </h1>
                <StatusPill active={organizer.isActive} />
              </div>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                @{organizer.slug}
                {organizer.heroTitle ? ` | ${organizer.heroTitle}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/dashboard/admin/organizers/${organizerId}/edit`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Edit Organizer
                <LuArrowUpRight className="text-base" />
              </Link>
              <Link
                href={`/${organizer.slug}`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                View Public Page
                <LuArrowUpRight className="text-base" />
              </Link>
              <button
                type="button"
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                <LuPower className="text-base" />
                {toggleMutation.isPending
                  ? "Updating..."
                  : organizer.isActive
                    ? "Suspend Organizer"
                    : "Reactivate Organizer"}
              </button>
            </div>
          </div>

          {toggleMutation.error instanceof Error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              {toggleMutation.error.message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Organizer profile
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Contact Email
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                    <LuMail className="text-base text-purple-600 dark:text-purple-300" />
                    {organizer.contactEmail || "No contact email"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Contact Phone
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                    <LuPhone className="text-base text-purple-600 dark:text-purple-300" />
                    {organizer.contactPhone || "No contact phone"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Location
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                    <LuMapPin className="text-base text-purple-600 dark:text-purple-300" />
                    {organizer.location || "No location set"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Bank Account
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
                    {organizer.bankDetails?.accountName || "No payout account set"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {organizer.bankDetails?.bankName || "Bank name missing"}
                    {organizer.bankDetails?.accountNumber
                      ? ` | ${organizer.bankDetails.accountNumber}`
                      : ""}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04] md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    About
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {organizer.about || organizer.heroSubtitle || "No organizer profile copy yet."}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Gallery
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                    Update organizer gallery items
                  </h2>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                  <LuImage className="text-xl" />
                </div>
              </div>

              {galleryMessage ? (
                <div
                  className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                    galleryMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                  }`}
                >
                  {galleryMessage.text}
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                {galleryQuery.isLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    Loading organizer gallery...
                  </div>
                ) : galleryQuery.error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-5 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                    {galleryQuery.error instanceof Error
                      ? galleryQuery.error.message
                      : "We couldn't load organizer gallery items right now."}
                  </div>
                ) : galleryQuery.data && galleryQuery.data.length > 0 ? (
                  galleryQuery.data.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-bold text-slate-950 dark:text-white">
                            {item.caption || "Untitled gallery image"}
                          </p>
                          <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-300">
                            {item.imageUrl}
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Alt text: {item.altText || "Not provided"}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Display order: {item.displayOrder ?? 0}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => startEditingGalleryItem(item._id)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                          Edit Item
                        </button>
                      </div>

                      {editingGalleryId === item._id ? (
                        <div className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 dark:border-purple-500/20 dark:bg-slate-950/80">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block md:col-span-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                Image URL
                              </span>
                              <input
                                type="url"
                                value={galleryForm.imageUrl}
                                onChange={(event) =>
                                  setGalleryForm((current) => ({
                                    ...current,
                                    imageUrl: event.target.value,
                                  }))
                                }
                                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                Caption
                              </span>
                              <input
                                value={galleryForm.caption}
                                onChange={(event) =>
                                  setGalleryForm((current) => ({
                                    ...current,
                                    caption: event.target.value,
                                  }))
                                }
                                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                Alt Text
                              </span>
                              <input
                                value={galleryForm.altText}
                                onChange={(event) =>
                                  setGalleryForm((current) => ({
                                    ...current,
                                    altText: event.target.value,
                                  }))
                                }
                                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                Display Order
                              </span>
                              <input
                                type="number"
                                min="0"
                                value={galleryForm.displayOrder}
                                onChange={(event) =>
                                  setGalleryForm((current) => ({
                                    ...current,
                                    displayOrder: event.target.value,
                                  }))
                                }
                                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => updateGalleryMutation.mutate()}
                              disabled={updateGalleryMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <LuSave className="text-base" />
                              {updateGalleryMutation.isPending ? "Saving..." : "Save Gallery Item"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingGalleryId(null)}
                              className="inline-flex items-center rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    No gallery items available for this organizer yet.
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Recent Events
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                    Latest organizer activity
                  </h2>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                  <LuCalendarDays className="text-xl" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-slate-950 dark:text-white">
                            {event.title}
                          </p>
                          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <LuMapPin className="text-base text-purple-600 dark:text-purple-300" />
                            {event.location || "No location"}
                          </p>
                        </div>

                        <div className="text-right text-sm text-slate-600 dark:text-slate-300">
                          <p>{formatDateTime(event.date)}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                            added {formatDateTime(event.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    No recent event activity available for this organizer yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Revenue + Tickets
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                    Organizer summary
                  </h2>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <LuShieldCheck className="text-xl" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Total Events
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {stats.totalEvents}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Paid Orders
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {stats.totalPaidOrders}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Gross Revenue
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {formatCurrency(stats.grossRevenue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Platform Fees
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {formatCurrency(stats.platformFees)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Tickets Sold
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {stats.totalTicketsSold}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Check-In Rate
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {checkInRate}%
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {stats.totalCheckedInTickets} checked in
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Lifecycle
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Created
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {formatDateTime(organizer.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Last Updated
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {formatDateTime(organizer.updatedAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminOrganizerDetailsClient;
