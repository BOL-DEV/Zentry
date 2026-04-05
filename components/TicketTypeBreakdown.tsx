"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuDownload, LuPlus } from "react-icons/lu";
import OrganizerAttendeesList from "@/components/OrganizerAttendeesList";
import Card from "@/components/Card";
import LoadingPulseCard from "@/components/LoadingPulseCard";
import { formatCurrency, formatNumber, percent } from "@/helpers/format";
import { useParams } from "next/navigation";
import {
  createOrganizerDashboardTicketType,
  getOrganizerEventAttendees,
} from "@/helpers/organizer-api";
import type { TicketTypeBreak } from "@/helpers/type";

interface Props {
  ticketTypes: TicketTypeBreak[];
  eventId: string;
  detailHref?: string;
  detailLabel?: string;
}

function TicketTypeBreakdown(props: Props) {
  const { ticketTypes, eventId, detailHref, detailLabel = "View Event Details" } = props;
  const params = useParams<{ organizer?: string }>();
  const organizer = params?.organizer;
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantityAvailable: "",
    displayOrder: "",
  });
  const [formMessage, setFormMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const verifyHref = organizer
    ? `/${organizer}/dashboard/${eventId}/verify`
    : `/dashboard/${eventId}/verify`;
  const attendeesQuery = useQuery({
    queryKey: ["dashboard-event-attendees", eventId],
    queryFn: () => getOrganizerEventAttendees(eventId),
  });
  const createTicketTypeMutation = useMutation({
    mutationFn: () =>
      createOrganizerDashboardTicketType(eventId, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        quantityAvailable: Number(form.quantityAvailable),
        displayOrder: form.displayOrder ? Number(form.displayOrder) : 0,
      }),
    onSuccess: () => {
      setForm({
        name: "",
        description: "",
        price: "",
        quantityAvailable: "",
        displayOrder: "",
      });
      setFormMessage({
        type: "success",
        text: "Ticket type created successfully.",
      });
      if (organizer) {
        queryClient.invalidateQueries({
          queryKey: ["organizer-dashboard", organizer],
        });
      }
    },
    onError: (error) => {
      setFormMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't create the ticket type.",
      });
    },
  });

  const ticketTypeRows = useMemo(() => {
    return ticketTypes.map((t) => {
      const remaining = Math.max(0, t.total - t.sold);
      const lineRevenue = t.sold * t.price;
      const pct = percent(t.sold, t.total);

      return { ...t, remaining, lineRevenue, pct };
    });
  }, [ticketTypes]);

  return (
    <div className="border-t border-slate-200 dark:border-white/10">
      <div className="p-6">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Ticket Type Breakdown
        </h4>

        <div className="mt-4 space-y-4">
          {ticketTypeRows.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">
                    {t.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {formatCurrency(t.price)} per ticket
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold tracking-tight text-purple-700 dark:text-purple-400">
                    {formatCurrency(t.lineRevenue)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatNumber(t.sold)} sold
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatNumber(t.remaining)} remaining
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-300">
                Inventory: {formatNumber(t.sold)}/{formatNumber(t.total)}
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-purple-700 dark:bg-purple-500"
                  style={{ width: `${t.pct}%` }}
                  aria-label={`${t.pct}% sold`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Link
            href={verifyHref}
            className="inline-flex items-center justify-center rounded-xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-800 active:scale-[0.99]"
          >
            Verify Tickets
          </Link>

          {detailHref ? (
            <Link
              href={detailHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <LuDownload className="text-base" />
              {detailLabel}
            </Link>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h5 className="text-base font-semibold text-slate-900 dark:text-white">
                Create Ticket Type
              </h5>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Add a new pricing tier for this event.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateForm((value) => !value)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <LuPlus className="text-base" />
              {showCreateForm ? "Hide Form" : "Add Ticket Type"}
            </button>
          </div>

          {showCreateForm ? (
            <form
              className="mt-5 grid gap-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                setFormMessage(null);
                createTicketTypeMutation.mutate();
              }}
            >
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Regular"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
              />
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="Price"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
              />
              <input
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Description"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
              />
              <input
                required
                type="number"
                min="1"
                value={form.quantityAvailable}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    quantityAvailable: event.target.value,
                  }))
                }
                placeholder="Quantity Available"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
              />
              <input
                type="number"
                min="0"
                value={form.displayOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayOrder: event.target.value,
                  }))
                }
                placeholder="Display Order"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
              />

              <div className="md:col-span-2">
                {formMessage ? (
                  <div
                    className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                      formMessage.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                        : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                    }`}
                  >
                    {formMessage.text}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={createTicketTypeMutation.isPending}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-purple-700 px-4 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {createTicketTypeMutation.isPending
                    ? "Creating Ticket Type..."
                    : "Create Ticket Type"}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="mt-8">
          {attendeesQuery.isLoading ? (
            <LoadingPulseCard
              compact
              title="Loading attendees"
              description="Bringing in the latest guest list for this event."
            />
          ) : attendeesQuery.error ? (
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {attendeesQuery.error instanceof Error
                  ? attendeesQuery.error.message
                  : "We couldn't load attendees for this event."}
              </p>
            </Card>
          ) : (
            <OrganizerAttendeesList
              attendees={attendeesQuery.data?.attendees ?? []}
              title="Attendees"
              description="Everyone who has purchased a ticket for this event."
              maxHeightClass="max-h-[26rem]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketTypeBreakdown
