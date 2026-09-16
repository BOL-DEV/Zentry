"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LuX } from "react-icons/lu";

import Card from "@/components/Card";
import { createOrganizerGalleryItemsBulk } from "@/helpers/organizer-api";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";

function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const nextUrls = files.map((file) => URL.createObjectURL(file));
    setUrls(nextUrls);

    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  return urls;
}

function OrganizerCreateGalleryClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);

  const previewUrls = useObjectUrls(files);

  const inputStyles =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const createMutation = useMutation({
    mutationFn: () => {
      if (!files.length) {
        throw new Error("Choose at least one image to upload.");
      }

      return createOrganizerGalleryItemsBulk({
        imageFiles: files,
        caption: caption.trim() || undefined,
      });
    },
    onSuccess: (result) => {
      const successText = `${result.created.length} image${result.created.length === 1 ? "" : "s"} uploaded successfully.`;
      const failureText = result.failed.length
        ? ` ${result.failed.length} failed: ${result.failed.map((item) => item.filename).join(", ")}.`
        : "";

      if (result.created.length) {
        setMessage({ type: "success", text: successText + failureText });
        router.push(`/${organizer}/gallery`);
        router.refresh();
      } else {
        setMessage({
          type: "error",
          text: "All uploads failed. " + result.failed.map((item) => item.reason).join(", "),
        });
      }
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "We couldn't upload the images.",
      });
    },
  });

  function removeFileAt(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Organizer Workspace"
          title="Add Gallery Images"
          description="Publish new gallery images for this organizer. Select multiple photos to upload them all at once."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
          showLogoutButton={false}
          showActions={false}
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
                Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files ?? []))
                }
                className={inputStyles}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select multiple images to upload them together (up to 20 at a time).
              </p>
            </div>

            {previewUrls.length ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {previewUrls.map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={files[index]?.name ?? "Selected image"}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFileAt(index)}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                      aria-label={`Remove ${files[index]?.name ?? "image"}`}
                    >
                      <LuX className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Caption (applied to all images)
              </label>
              <input
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                className={inputStyles}
                placeholder="Opening moments from the event"
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
              disabled={createMutation.isPending || !files.length}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createMutation.isPending
                ? "Uploading Images..."
                : files.length > 1
                  ? `Upload ${files.length} Images`
                  : "Upload Image"}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default OrganizerCreateGalleryClient;
