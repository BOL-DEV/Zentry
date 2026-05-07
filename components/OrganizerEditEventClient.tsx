"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Card from "@/components/Card";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import {
  getOrganizerDashboardEventForEdit,
  updateOrganizerDashboardEvent,
} from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const textAreaStyles =
  "min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

function toDateTimeLocal(isoValue?: string) {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

type Props = {
  organizer: string;
  eventId: string;
};

function OrganizerEditEventClient({ organizer, eventId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    posterUrl: "",
    dressCode: "",
    policies: "",
  });

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      try {
        const data = await getOrganizerDashboardEventForEdit(organizer, eventId);
        if (!active) return;

        setForm({
          title: data.event.title || "",
          description: data.event.description || "",
          date: toDateTimeLocal(data.event.date),
          location: data.event.location || "",
          posterUrl: data.event.posterUrl || "",
          dressCode: data.event.dressCode || "",
          policies: data.event.policies || "",
        });
      } catch (error) {
        if (!active) return;
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "We couldn't load this event right now.",
        });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      active = false;
    };
  }, [eventId, organizer]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateOrganizerDashboardEvent(eventId, {
        title: form.title.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
        location: form.location.trim(),
        posterUrl: form.posterUrl.trim(),
        dressCode: form.dressCode.trim() || undefined,
        policies: form.policies.trim() || undefined,
      }),
    onSuccess: () => {
      setMessage({
        type: "success",
        text: "Event updated successfully.",
      });
      router.push(`/${organizer}/dashboard/${eventId}`);
      router.refresh();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't update this event.",
      });
    },
  });

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Organizer Workspace"
          title="Edit Event"
          description="Update the core event details without leaving the organizer workspace."
          backHref={`/${organizer}/dashboard/${eventId}`}
          backLabel="Back to Event"
          showLogoutButton={false}
          showActions={false}
        />

        <Card className="mt-8">
          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Loading event details...
            </p>
          ) : (
            <form
              className="space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage(null);
                updateMutation.mutate();
              }}
            >
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Event Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Adjust the event information attendees and buyers will see.
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
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Description
                    </label>
                    <textarea
                      required
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className={textAreaStyles}
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
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          date: event.target.value,
                        }))
                      }
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
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Poster URL
                    </label>
                    <input
                      type="url"
                      value={form.posterUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          posterUrl: event.target.value,
                        }))
                      }
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Dress Code
                    </label>
                    <input
                      value={form.dressCode}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          dressCode: event.target.value,
                        }))
                      }
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Policies
                    </label>
                    <input
                      value={form.policies}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          policies: event.target.value,
                        }))
                      }
                      className={inputStyles}
                    />
                  </div>
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

              <button
                type="submit"
                disabled={updateMutation.isPending || isLoading}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updateMutation.isPending ? "Saving Changes..." : "Save Event Changes"}
              </button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}

export default OrganizerEditEventClient;
