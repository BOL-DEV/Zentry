"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LuPlus, LuTrash2 } from "react-icons/lu";

import Card from "@/components/Card";
import {
  createOrganizerDashboardEvent,
  createOrganizerDashboardTicketType,
} from "@/helpers/organizer-api";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";

type TicketDraft = {
  id: string;
  name: string;
  description: string;
  price: string;
  quantityAvailable: string;
  displayOrder: string;
};

function createEmptyTicketDraft(index: number): TicketDraft {
  return {
    id: `ticket-${index}-${Date.now()}`,
    name: "",
    description: "",
    price: "",
    quantityAvailable: "",
    displayOrder: String(index),
  };
}

function OrganizerCreateEventClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    posterUrl: "",
    dressCode: "",
    policies: "",
  });
  const [ticketTypes, setTicketTypes] = useState<TicketDraft[]>([
    createEmptyTicketDraft(0),
  ]);
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);

  const inputStyles =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const textAreaStyles =
    "min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const createMutation = useMutation({
    mutationFn: async () => {
      const validTicketTypes = ticketTypes.filter(
        (ticket) =>
          ticket.name.trim() ||
          ticket.description.trim() ||
          ticket.price.trim() ||
          ticket.quantityAvailable.trim(),
      );

      if (!validTicketTypes.length) {
        throw new Error("Add at least one ticket type before creating the event.");
      }

      for (const ticket of validTicketTypes) {
        if (!ticket.name.trim()) {
          throw new Error("Each ticket type needs a name.");
        }

        if (!ticket.price.trim() || Number(ticket.price) < 0) {
          throw new Error(`Enter a valid price for ${ticket.name || "each ticket type"}.`);
        }

        if (!ticket.quantityAvailable.trim() || Number(ticket.quantityAvailable) < 1) {
          throw new Error(`Enter a valid quantity for ${ticket.name || "each ticket type"}.`);
        }
      }

      const event = await createOrganizerDashboardEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        location: form.location.trim(),
        posterUrl: form.posterUrl.trim(),
        dressCode: form.dressCode.trim() || undefined,
        policies: form.policies.trim() || undefined,
      });

      for (const [index, ticket] of validTicketTypes.entries()) {
        await createOrganizerDashboardTicketType(event._id, {
          name: ticket.name.trim(),
          description: ticket.description.trim() || undefined,
          price: Number(ticket.price),
          quantityAvailable: Number(ticket.quantityAvailable),
          displayOrder: ticket.displayOrder.trim()
            ? Number(ticket.displayOrder)
            : index,
        });
      }

      return event;
    },
    onSuccess: (event) => {
      setMessage({
        type: "success",
        text: "Event and ticket types created successfully.",
      });
      router.push(`/${organizer}/dashboard/${event._id}`);
      router.refresh();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't complete the event setup.",
      });
    },
  });

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateTicketType(id: string, name: keyof TicketDraft, value: string) {
    setTicketTypes((current) =>
      current.map((ticket) =>
        ticket.id === id ? { ...ticket, [name]: value } : ticket,
      ),
    );
  }

  function addTicketType() {
    setTicketTypes((current) => [
      ...current,
      createEmptyTicketDraft(current.length),
    ]);
  }

  function removeTicketType(id: string) {
    setTicketTypes((current) =>
      current.length === 1 ? current : current.filter((ticket) => ticket.id !== id),
    );
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Organizer Workspace"
          title="Create Event"
          description="Set up your event details and first ticket types together so you can publish once and move on."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
        />

        <Card className="mt-8">
          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(null);
              createMutation.mutate();
            }}
          >
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Event Details
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Start with the core event information attendees will see.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Event Title
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    className={inputStyles}
                    placeholder="Product Design Meetup"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Description
                  </label>
                  <textarea
                    required
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    className={textAreaStyles}
                    placeholder="Tell attendees what this event is about..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Date and Time
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={form.date}
                    onChange={(event) => updateField("date", event.target.value)}
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Location
                  </label>
                  <input
                    required
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    className={inputStyles}
                    placeholder="Victoria Island, Lagos"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Poster URL
                  </label>
                  <input
                    required
                    type="url"
                    value={form.posterUrl}
                    onChange={(event) => updateField("posterUrl", event.target.value)}
                    className={inputStyles}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Dress Code
                  </label>
                  <input
                    value={form.dressCode}
                    onChange={(event) => updateField("dressCode", event.target.value)}
                    className={inputStyles}
                    placeholder="Smart casual"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                    Policies
                  </label>
                  <input
                    value={form.policies}
                    onChange={(event) => updateField("policies", event.target.value)}
                    className={inputStyles}
                    placeholder="No refunds"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-5 border-t border-slate-200 pt-8 dark:border-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Ticket Types
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Add the ticket tiers you want available as soon as the event goes live.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTicketType}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <LuPlus className="text-base" />
                  Add Ticket Type
                </button>
              </div>

              <div className="space-y-5">
                {ticketTypes.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Ticket Type {index + 1}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Create pricing and inventory for this access tier.
                        </p>
                      </div>

                      {ticketTypes.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeTicketType(ticket.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/20 dark:bg-white/5 dark:text-rose-300 dark:hover:bg-rose-500/10"
                          aria-label={`Remove ticket type ${index + 1}`}
                        >
                          <LuTrash2 className="text-base" />
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                          Name
                        </label>
                        <input
                          required
                          value={ticket.name}
                          onChange={(event) =>
                            updateTicketType(ticket.id, "name", event.target.value)
                          }
                          className={inputStyles}
                          placeholder="Regular"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                          Price
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          value={ticket.price}
                          onChange={(event) =>
                            updateTicketType(ticket.id, "price", event.target.value)
                          }
                          className={inputStyles}
                          placeholder="5000"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                          Description
                        </label>
                        <input
                          value={ticket.description}
                          onChange={(event) =>
                            updateTicketType(ticket.id, "description", event.target.value)
                          }
                          className={inputStyles}
                          placeholder="Standard access"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                          Quantity Available
                        </label>
                        <input
                          required
                          type="number"
                          min="1"
                          value={ticket.quantityAvailable}
                          onChange={(event) =>
                            updateTicketType(
                              ticket.id,
                              "quantityAvailable",
                              event.target.value,
                            )
                          }
                          className={inputStyles}
                          placeholder="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={ticket.displayOrder}
                          onChange={(event) =>
                            updateTicketType(ticket.id, "displayOrder", event.target.value)
                          }
                          className={inputStyles}
                          placeholder={`${index}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {message ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                }`}
              >
                {message.text}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {createMutation.isPending
                  ? "Creating Event Setup..."
                  : "Create Event and Ticket Types"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default OrganizerCreateEventClient;
