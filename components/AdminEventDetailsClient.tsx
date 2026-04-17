"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowLeft, LuCalendarDays, LuMail, LuMapPin, LuPhone, LuReceiptText, LuSave, LuTag } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { formatCurrency } from "@/helpers/format";
import {
  getAdminEventDetail,
  getAdminEventTicketTypesForEdit,
  getAdminProfile,
  updateAdminEventTicketType,
  updateAdminEventTicketTypeQuantity,
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

function StatusPill({ children, tone }: { children: React.ReactNode; tone: "emerald" | "slate" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
      tone === "emerald"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300"
    }`}>
      {children}
    </span>
  );
}

type Props = { eventId: string };

function AdminEventDetailsClient({ eventId }: Props) {
  const router = useRouter();
  const { token, user } = useAdminAuthSession();
  const queryClient = useQueryClient();
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    quantityAvailable: "",
    isActive: true,
  });
  const [ticketMessage, setTicketMessage] = useState<
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

  const eventQuery = useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: () => getAdminEventDetail(eventId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });
  const ticketTypesQuery = useQuery({
    queryKey: ["admin-event-ticket-types", eventId, eventQuery.data?.event.organizer.slug],
    queryFn: () =>
      getAdminEventTicketTypesForEdit(
        eventQuery.data?.event.organizer.slug || "",
        eventId,
      ),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin) && Boolean(eventQuery.data?.event.organizer.slug),
    retry: false,
  });

  const updateTicketTypeMutation = useMutation({
    mutationFn: () => {
      if (!editingTicketId) {
        throw new Error("Select a ticket tier to update.");
      }

      return updateAdminEventTicketType(eventId, editingTicketId, {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        price: Number(editForm.price),
        isActive: editForm.isActive,
      });
    },
    onSuccess: async () => {
      setTicketMessage({ type: "success", text: "Ticket tier updated successfully." });
      setEditingTicketId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-event-ticket-types", eventId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-events"] }),
      ]);
    },
    onError: (error) => {
      setTicketMessage({
        type: "error",
        text: error instanceof Error ? error.message : "We couldn't update that ticket tier.",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: () => {
      if (!editingTicketId) {
        throw new Error("Select a ticket tier to update.");
      }

      return updateAdminEventTicketTypeQuantity(
        eventId,
        editingTicketId,
        Number(editForm.quantityAvailable),
      );
    },
    onSuccess: async () => {
      setTicketMessage({ type: "success", text: "Ticket inventory updated successfully." });
      setEditingTicketId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-event-ticket-types", eventId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-event", eventId] }),
        queryClient.invalidateQueries({ queryKey: ["admin-events"] }),
      ]);
    },
    onError: (error) => {
      setTicketMessage({
        type: "error",
        text: error instanceof Error ? error.message : "We couldn't update ticket inventory.",
      });
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/events/${eventId}`)}&reason=auth-required`);
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
    router.replace(`/admin/login?next=${encodeURIComponent(`/dashboard/admin/events/${eventId}`)}&reason=session-expired`);
  }, [eventId, profileQuery.error, profileQuery.isFetching, router]);

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching || eventQuery.isLoading) {
    return <FullPageLoader title="Loading event details" description="Pulling event performance, organizer info, and recent order activity." />;
  }

  if (profileQuery.error || eventQuery.error || !profileQuery.data?.admin || !eventQuery.data) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : eventQuery.error instanceof Error
          ? eventQuery.error.message
          : "We couldn't load this event right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader role="admin" email={profileQuery.data?.admin.email || user?.email || "Platform workspace"} />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const { event, stats, recentOrders } = eventQuery.data;
  const squadFeeTotal = (stats.squadGatewayFees ?? 0) + (stats.squadTransferFees ?? 0);
  const checkInRate = stats.totalTicketsSold > 0 ? Math.round((stats.totalCheckedInTickets / stats.totalTicketsSold) * 100) : 0;
  const ticketRows = (ticketTypesQuery.data ?? []).map((ticket) => {
    const remaining = Math.max(
      0,
      ticket.quantityAvailable - ticket.quantitySold - (ticket.quantityReserved ?? 0),
    );

    return { ...ticket, remaining };
  });

  function startEditingTicket(ticketId: string) {
    const ticket = ticketTypesQuery.data?.find((entry) => entry._id === ticketId);

    if (!ticket) {
      setTicketMessage({
        type: "error",
        text: "We couldn't load that ticket tier for editing.",
      });
      return;
    }

    setEditingTicketId(ticketId);
    setEditForm({
      name: ticket.name,
      description: ticket.description || "",
      price: String(ticket.price),
      quantityAvailable: String(ticket.quantityAvailable),
      isActive: ticket.isActive,
    });
    setTicketMessage(null);
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader role="admin" email={profileQuery.data.admin.email || user?.email || "Platform workspace"} />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/dashboard/admin/events" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200">
            <LuArrowLeft className="text-base" />
            Back to events
          </Link>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">Event Detail</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">{event.title}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{event.organizer.name} | @{event.organizer.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/dashboard/admin/events/${eventId}/edit`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                Edit Event
                <LuCalendarDays className="text-base" />
              </Link>
              <StatusPill tone={event.isUpcoming ? "emerald" : "slate"}>{event.isUpcoming ? "Upcoming" : "Completed"}</StatusPill>
              <StatusPill tone={event.organizer.isActive ? "emerald" : "slate"}>{event.organizer.isActive ? "Organizer Active" : "Organizer Inactive"}</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Event profile</p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{event.description || "No event description provided."}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><LuCalendarDays className="text-base text-purple-600 dark:text-purple-300" />{formatDateTime(event.date)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white"><LuMapPin className="text-base text-purple-600 dark:text-purple-300" />{event.location || "No location"}</p>
                </div>
                {event.dressCode ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04] md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Dress Code</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.dressCode}</p>
                  </div>
                ) : null}
                {event.policies ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04] md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Policies</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.policies}</p>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                  <LuTag className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Ticket tiers</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Manage inventory and pricing</h2>
                </div>
              </div>
              {ticketMessage ? (
                <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
                  ticketMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                }`}>
                  {ticketMessage.text}
                </div>
              ) : null}
              <div className="mt-6 space-y-4">
                {ticketTypesQuery.isLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    Loading ticket tiers...
                  </div>
                ) : ticketTypesQuery.error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-5 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                    {ticketTypesQuery.error instanceof Error
                      ? ticketTypesQuery.error.message
                      : "We couldn't load ticket tiers right now."}
                  </div>
                ) : ticketRows.length > 0 ? (
                  ticketRows.map((ticket) => (
                    <div key={ticket._id} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-bold text-slate-950 dark:text-white">{ticket.name}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {formatCurrency(ticket.price)} per ticket
                          </p>
                          {ticket.description ? (
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ticket.description}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => startEditingTicket(ticket._id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                          Edit Tier
                        </button>
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-4">
                        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Available</p>
                          <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{ticket.quantityAvailable}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Sold</p>
                          <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{ticket.quantitySold}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Reserved</p>
                          <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{ticket.quantityReserved ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Remaining</p>
                          <p className="mt-2 text-xl font-bold text-slate-950 dark:text-white">{ticket.remaining}</p>
                        </div>
                      </div>

                      {editingTicketId === ticket._id ? (
                        <div className="mt-5 rounded-2xl border border-purple-200 bg-white p-5 dark:border-purple-500/20 dark:bg-slate-950/80">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">Tier Name</span>
                              <input
                                value={editForm.name}
                                onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">Price</span>
                              <input
                                type="number"
                                min="0"
                                value={editForm.price}
                                onChange={(event) => setEditForm((current) => ({ ...current, price: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                            <label className="block md:col-span-2">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">Description</span>
                              <textarea
                                rows={3}
                                value={editForm.description}
                                onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                            <label className="block">
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">Inventory</span>
                              <input
                                type="number"
                                min="0"
                                value={editForm.quantityAvailable}
                                onChange={(event) => setEditForm((current) => ({ ...current, quantityAvailable: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                              />
                            </label>
                            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                              <input
                                type="checkbox"
                                checked={editForm.isActive}
                                onChange={(event) => setEditForm((current) => ({ ...current, isActive: event.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                              />
                              Keep this tier active for checkout
                            </label>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => updateTicketTypeMutation.mutate()}
                              disabled={updateTicketTypeMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              <LuSave className="text-base" />
                              {updateTicketTypeMutation.isPending ? "Saving..." : "Save Tier"}
                            </button>
                            <button
                              type="button"
                              onClick={() => updateQuantityMutation.mutate()}
                              disabled={updateQuantityMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                            >
                              {updateQuantityMutation.isPending ? "Updating..." : "Update Inventory"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTicketId(null)}
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
                    No ticket tiers found for this event yet.
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                  <LuReceiptText className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Recent Orders</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Latest payment activity</h2>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-950 dark:text-white">{order.buyerName}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{order.buyerEmail}</p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Order reference: {order.paymentReference || "Not available yet"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-950 dark:text-white">{formatCurrency(order.totalAmount)}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{order.paymentStatus}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{order.settlementStatus || "No settlement status"}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                    No recent order activity for this event yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Performance summary</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Paid Orders</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{stats.totalPaidOrders}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Tickets Sold</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{stats.totalTicketsSold}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Gross Revenue</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(stats.grossRevenue)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Organizer Payout</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(stats.organizerPayoutAmount)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Platform Fees</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(stats.platformFees)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Squad Fees</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{formatCurrency(squadFeeTotal)}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Check-in Rate</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{checkInRate}%</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{stats.totalCheckedInTickets} checked in from {stats.totalTicketsSold} sold tickets</p></div>
              </div>
            </Card>

            <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Organizer contact</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{event.organizer.name}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">@{event.organizer.slug}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LuMail className="text-base text-purple-600 dark:text-purple-300" />{event.organizer.contactEmail || "No contact email"}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LuPhone className="text-base text-purple-600 dark:text-purple-300" />{event.organizer.contactPhone || "No contact phone"}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminEventDetailsClient;
