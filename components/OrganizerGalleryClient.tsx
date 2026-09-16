"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart } from "react-icons/fa6";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import ShareMenu from "@/components/ShareMenu";
import {
  getOrganizerGalleryData,
  likeGalleryPhoto,
  submitGalleryPhoto,
} from "@/helpers/organizer-api";
import type { OrganizerGalleryItem } from "@/helpers/type";

function GalleryCard({
  item,
  organizer,
}: {
  item: OrganizerGalleryItem;
  organizer: string;
}) {
  const queryClient = useQueryClient();
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [hasLiked, setHasLiked] = useState(item.hasLiked);

  const likeMutation = useMutation({
    mutationFn: () => likeGalleryPhoto(organizer, item.id),
    onSuccess: (result) => {
      setLikeCount(result.likeCount);
      setHasLiked(result.hasLiked);
      void queryClient.invalidateQueries({
        queryKey: ["organizer-gallery", organizer],
      });
    },
  });

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="relative h-80 w-full">
        <Image
          src={item.imageUrl}
          alt={item.altText}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={hasLiked || likeMutation.isPending}
              onClick={() => likeMutation.mutate()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition disabled:cursor-default dark:text-slate-200"
              aria-label={hasLiked ? "Liked" : "Like this photo"}
            >
              {hasLiked ? (
                <FaHeart className="text-base text-rose-600" />
              ) : (
                <FaRegHeart className="text-base" />
              )}
              {likeCount}
            </button>
            <ShareMenu url={shareUrl} title={item.title} />
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {item.dateText}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {item.description}
        </p>
      </div>
    </article>
  );
}

function SubmitPhotoSection({ organizer }: { organizer: string }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submittedByName, setSubmittedByName] = useState("");
  const [caption, setCaption] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!imageFile) {
        throw new Error("Choose a photo to share.");
      }

      return submitGalleryPhoto(organizer, {
        imageFile,
        caption: caption.trim() || undefined,
        submittedByName: submittedByName.trim() || undefined,
      });
    },
    onSuccess: (result) => {
      setConfirmation(result.message);
      setImageFile(null);
      setSubmittedByName("");
      setCaption("");
    },
  });

  return (
    <section className="mt-14 rounded-2xl border border-purple-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        Share Your Photo
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Were you at one of our events? Submit a photo to be featured here.
      </p>

      {confirmation ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          {confirmation}
        </p>
      ) : (
        <form
          className="mt-5 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            submitMutation.mutate();
          }}
        >
          <input
            type="file"
            accept="image/*"
            required
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white md:col-span-2"
          />
          <input
            placeholder="Your name (optional)"
            value={submittedByName}
            onChange={(event) => setSubmittedByName(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <input
            placeholder="Caption (optional)"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />

          {submitMutation.isError ? (
            <p className="text-sm text-rose-600 dark:text-rose-300 md:col-span-2">
              {submitMutation.error instanceof Error
                ? submitMutation.error.message
                : "We couldn't submit your photo."}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70 md:col-span-2"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Photo"}
          </button>
        </form>
      )}
    </section>
  );
}

function OrganizerGalleryClient({ organizer }: { organizer: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-gallery", organizer],
    queryFn: () => getOrganizerGalleryData(organizer),
  });

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
        <header className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Event Gallery
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            Explore stunning moments and memories from our past events.
          </p>
        </header>

        {isLoading ? (
          <section className="mt-10">
            <FullPageLoader
              title="Loading gallery"
              description="We are bringing in the latest event moments for this organizer."
            />
          </section>
        ) : error || !data ? (
          <section className="mt-10">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't load the organizer gallery."}
              </p>
            </Card>
          </section>
        ) : data.length === 0 ? (
          <section className="mt-10">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No gallery images have been published for this organizer yet.
              </p>
            </Card>
          </section>
        ) : (
          <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <GalleryCard key={item.id} item={item} organizer={organizer} />
            ))}
          </section>
        )}

        <SubmitPhotoSection organizer={organizer} />
      </div>
    </main>
  );
}

export default OrganizerGalleryClient;
