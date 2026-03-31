"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Card from "@/components/Card";
import { createOrganizerGalleryItem } from "@/helpers/organizer-api";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";

function OrganizerCreateGalleryClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    imageUrl: "",
    caption: "",
    altText: "",
    displayOrder: "",
  });
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);

  const inputStyles =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const createMutation = useMutation({
    mutationFn: () =>
      createOrganizerGalleryItem({
        imageUrl: form.imageUrl.trim(),
        caption: form.caption.trim() || undefined,
        altText: form.altText.trim() || undefined,
        displayOrder: form.displayOrder ? Number(form.displayOrder) : 0,
      }),
    onSuccess: () => {
      setMessage({
        type: "success",
        text: "Gallery image created successfully.",
      });
      router.push(`/${organizer}/gallery`);
      router.refresh();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't create the gallery item.",
      });
    },
  });

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Organizer Workspace"
          title="Add Gallery Image"
          description="Publish a new gallery image for this organizer."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
        />

        <Card className="mt-8">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(null);
              createMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Image URL
              </label>
              <input
                required
                type="url"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
                className={inputStyles}
                placeholder="https://example.com/gallery-image.jpg"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Caption
                </label>
                <input
                  value={form.caption}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      caption: event.target.value,
                    }))
                  }
                  className={inputStyles}
                  placeholder="Opening moments from the event"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Alt Text
                </label>
                <input
                  value={form.altText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      altText: event.target.value,
                    }))
                  }
                  className={inputStyles}
                  placeholder="Guests arriving at the venue"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Display Order
              </label>
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
                className={inputStyles}
                placeholder="0"
              />
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
              {createMutation.isPending ? "Adding Image..." : "Add Gallery Image"}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default OrganizerCreateGalleryClient;
