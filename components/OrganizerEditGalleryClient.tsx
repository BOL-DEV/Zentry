"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Card from "@/components/Card";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import {
  getOrganizerGalleryItem,
  updateOrganizerGalleryItem,
} from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

type Props = {
  organizer: string;
  galleryItemId: string;
};

function OrganizerEditGalleryClient({ organizer, galleryItemId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const [form, setForm] = useState({
    imageUrl: "",
    caption: "",
    altText: "",
    displayOrder: "",
  });

  useEffect(() => {
    let active = true;

    async function loadItem() {
      try {
        const item = await getOrganizerGalleryItem(organizer, galleryItemId);
        if (!active) return;

        setForm({
          imageUrl: item.imageUrl || "",
          caption: item.caption || "",
          altText: item.altText || "",
          displayOrder: String(item.displayOrder ?? 0),
        });
      } catch (error) {
        if (!active) return;
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "We couldn't load this gallery item.",
        });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadItem();

    return () => {
      active = false;
    };
  }, [galleryItemId, organizer]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateOrganizerGalleryItem(galleryItemId, {
        imageUrl: form.imageUrl.trim(),
        caption: form.caption.trim(),
        altText: form.altText.trim(),
        displayOrder: Number(form.displayOrder || 0),
      }),
    onSuccess: () => {
      setMessage({
        type: "success",
        text: "Gallery image updated successfully.",
      });
      router.push(`/${organizer}/dashboard/gallery`);
      router.refresh();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't update this gallery item.",
      });
    },
  });

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Organizer Workspace"
          title="Edit Gallery Image"
          description="Update gallery copy, artwork, and display order without recreating the item."
          backHref={`/${organizer}/dashboard/gallery`}
          backLabel="Back to Gallery Manager"
        />

        <Card className="mt-8">
          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Loading gallery image...
            </p>
          ) : (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage(null);
                updateMutation.mutate();
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
                disabled={updateMutation.isPending || isLoading}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updateMutation.isPending ? "Saving Changes..." : "Save Gallery Changes"}
              </button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}

export default OrganizerEditGalleryClient;
