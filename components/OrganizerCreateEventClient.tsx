"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

import Card from "@/components/Card";
import { createOrganizerDashboardEvent } from "@/helpers/organizer-api";

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
    mutationFn: () =>
      createOrganizerDashboardEvent({
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
        text: "Event created successfully. You can now add ticket types.",
      });
      router.push(`/${organizer}/dashboard`);
      router.refresh();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't create the event.",
      });
    },
  });

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        <Link
          href={`/${organizer}/dashboard`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <LuArrowLeft className="text-base" />
          Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Event
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Publish a new event for your organizer and configure ticket types next.
          </p>
        </div>

        <Card className="mt-8">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(null);
              createMutation.mutate();
            }}
          >
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
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("posterUrl", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("dressCode", event.target.value)
                  }
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
                  onChange={(event) =>
                    updateField("policies", event.target.value)
                  }
                  className={inputStyles}
                  placeholder="No refunds"
                />
              </div>
            </div>

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
              disabled={createMutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createMutation.isPending ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default OrganizerCreateEventClient;
