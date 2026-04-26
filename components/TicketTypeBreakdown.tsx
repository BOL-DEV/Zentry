"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuDownload, LuPencil, LuPlus, LuSave } from "react-icons/lu";
import OrganizerAttendeesList from "@/components/OrganizerAttendeesList";
import Card from "@/components/Card";
import LoadingPulseCard from "@/components/LoadingPulseCard";
import { formatCurrency, formatNumber, percent } from "@/helpers/format";
import { useParams } from "next/navigation";
import {
  createOrganizerDashboardTicketType,
  getOrganizerEventAttendees,
  getOrganizerDashboardTicketTypesForEdit,
  updateOrganizerDashboardTicketType,
  updateOrganizerDashboardTicketTypeQuantity,
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
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    quantityAvailable: "",
    isActive: true,
  });
  const verifyHref = organizer
    ? `/${organizer}/dashboard/${eventId}/verify`
    : `/dashboard/${eventId}/verify`;
  const attendeesQuery = useQuery({
    queryKey: ["dashboard-event-attendees", eventId],
    queryFn: () => getOrganizerEventAttendees(eventId),
  });
  const ticketTypesQuery = useQuery({
    queryKey: ["dashboard-event-ticket-types", organizer, eventId],
    queryFn: () => getOrganizerDashboardTicketTypesForEdit(organizer || "", eventId),
    enabled: Boolean(organizer),
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
  const saveTicketTypeMutation = useMutation({
    mutationFn: () => {
      if (!editingTicketId) {
        throw new Error("Select a ticket type to update.");
      }

      const source = ticketTypesQuery.data?.find((ticket) => ticket._id === editingTicketId);
      const quantityAvailable = Number(editForm.quantityAvailable);

      return (async () => {
        await updateOrganizerDashboardTicketType(eventId, editingTicketId, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined,
          price: Number(editForm.price),
          isActive: editForm.isActive,
        });

        if (!source || source.quantityAvailable !== quantityAvailable) {
          await updateOrganizerDashboardTicketTypeQuantity(
            eventId,
            editingTicketId,
            quantityAvailable,
          );
        }
      })();
    },
    onSuccess: () => {
      setFormMessage({
        type: "success",
        text: "Ticket type updated successfully.",
      });
      setEditingTicketId(null);
      void queryClient.invalidateQueries({
        queryKey: ["dashboard-event-ticket-types", organizer, eventId],
      });
      if (organizer) {
        void queryClient.invalidateQueries({
          queryKey: ["organizer-dashboard-event-details", organizer, eventId],
        });
        void queryClient.invalidateQueries({
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
            : "We couldn't update the ticket type.",
      });
    },
  });

  const ticketTypeRows = useMemo(() => {
    return ticketTypes.map((t) => {
      const remaining = Math.max(0, t.total - t.sold);
      const pct = percent(t.sold, t.total);

      return { ...t, remaining, pct };
    });
  }, [ticketTypes]);

  function startEditingTicket(ticketId: string) {
    const source = ticketTypesQuery.data?.find((ticket) => ticket._id === ticketId);

    if (!source) {
      setFormMessage({
        type: "error",
        text: "We couldn't load that ticket type for editing.",
      });
      return;
    }

    setEditingTicketId(ticketId);
    setEditForm({
      name: source.name,
      description: source.description || "",
      price: String(source.price),
      quantityAvailable: String(source.quantityAvailable),
      isActive: source.isActive,
    });
    setFormMessage(null);
  }

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
                    {formatCurrency(t.price)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatNumber(t.sold)} sold
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatNumber(t.remaining)} remaining
                  </div>
                  {organizer ? (
                    <button
                      type="button"
                      onClick={() => startEditingTicket(t.id)}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <LuPencil className="text-sm" />
                      Edit Tier
                    </button>
                  ) : null}
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

              {editingTicketId === t.id ? (
                <form
                  className="mt-5 grid gap-4 md:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setFormMessage(null);
                    saveTicketTypeMutation.mutate();
                  }}
                >
                  <input
                    required
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ticket name"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
                  />
                  <input
                    required
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    placeholder="Price"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
                  />
                  <input
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((current) => ({
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
                    min={Math.max(1, t.sold)}
                    value={editForm.quantityAvailable}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        quantityAvailable: event.target.value,
                      }))
                    }
                    placeholder="Quantity Available"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20"
                  />
                  <label className="md:col-span-2 inline-flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-purple-700 focus:ring-purple-500"
                    />
                    Ticket type is active
                  </label>

                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={saveTicketTypeMutation.isPending}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <LuSave className="text-base" />
                      {saveTicketTypeMutation.isPending
                        ? "Saving Changes..."
                        : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTicketId(null);
                        setFormMessage(null);
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
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
              eventId={eventId}
              eventTitle={attendeesQuery.data?.event.title}
              maxHeightClass="max-h-[26rem]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketTypeBreakdown
