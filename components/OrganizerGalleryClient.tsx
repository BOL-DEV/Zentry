"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  LuLayoutGrid,
  LuList,
  LuLayers,
  LuVideo,
  LuImage,
  LuX,
  LuUpload,
} from "react-icons/lu";
import { FaHeart, FaComment } from "react-icons/fa6";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import InstagramPostCard from "@/components/InstagramPostCard";
import {
  getOrganizerGalleryData,
  submitGalleryPhoto,
} from "@/helpers/organizer-api";
import type { OrganizerGalleryItem } from "@/helpers/type";

function SubmitPhotoSection({ organizer }: { organizer: string }) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submittedByName, setSubmittedByName] = useState("");
  const [caption, setCaption] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (!mediaFiles.length) {
        throw new Error("Choose at least one photo or video to share.");
      }

      return submitGalleryPhoto(organizer, {
        mediaFiles,
        caption: caption.trim() || undefined,
        submittedByName: submittedByName.trim() || undefined,
      });
    },
    onSuccess: (result) => {
      setConfirmation(result.message);
      setMediaFiles([]);
      setPreviewUrls([]);
      setSubmittedByName("");
      setCaption("");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setMediaFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <section className="mt-16 rounded-2xl border border-purple-200/70 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-white/5 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
          <LuUpload className="text-2xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Share Your Moments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Were you at our event? Upload your photos & videos to be featured.
          </p>
        </div>
      </div>

      {confirmation ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          <p className="font-semibold">{confirmation}</p>
          <button
            type="button"
            onClick={() => setConfirmation(null)}
            className="mt-3 text-xs font-bold text-emerald-700 underline dark:text-emerald-300"
          >
            Share another moment
          </button>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitMutation.mutate();
          }}
        >
          {/* File Picker */}
          <div>
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-purple-500 hover:bg-purple-50/30 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:hover:border-purple-400">
              <LuUpload className="text-3xl text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Choose photos or videos
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports multiple JPG, PNG, MP4, MOV files
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Previews Strip */}
          {previewUrls.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto py-2">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black"
                >
                  {mediaFiles[idx]?.type.startsWith("video/") ? (
                    <video
                      src={url}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <Image
                      src={url}
                      alt="Upload preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                  >
                    <LuX className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            placeholder="Your name or handle (optional)"
            value={submittedByName}
            onChange={(event) => setSubmittedByName(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />

          <textarea
            placeholder="Write a caption..."
            value={caption}
            rows={2}
            onChange={(event) => setCaption(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />

          {submitMutation.isError ? (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {submitMutation.error instanceof Error
                ? submitMutation.error.message
                : "We couldn't submit your photo."}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitMutation.isPending || mediaFiles.length === 0}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Post"}
          </button>
        </form>
      )}
    </section>
  );
}

function GridTile({
  item,
  onClick,
}: {
  item: OrganizerGalleryItem;
  onClick: () => void;
}) {
  const isVideo =
    item.media[0]?.mediaType === "video" ||
    /\.(mp4|webm|mov)$/i.test(item.media[0]?.url || item.imageUrl);
  const isCarousel = item.media.length > 1;
  const thumbnailUrl = item.media[0]?.thumbnailUrl || item.imageUrl;

  return (
    <div
      onClick={onClick}
      className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-slate-900"
    >
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={item.altText || item.title}
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-600">
          <LuImage className="text-3xl" />
        </div>
      )}

      {/* Top-Right Badge Icons */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 text-white drop-shadow-md">
        {isCarousel && (
          <div className="rounded-md bg-black/60 p-1.5 backdrop-blur-sm">
            <LuLayers className="text-sm" />
          </div>
        )}
        {isVideo && (
          <div className="rounded-md bg-black/60 p-1.5 backdrop-blur-sm">
            <LuVideo className="text-sm" />
          </div>
        )}
      </div>

      {/* Hover Likes & Comments Overlay */}
      <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white font-bold text-sm">
        <span className="flex items-center gap-1.5">
          <FaHeart className="text-base text-rose-500" />
          {item.likeCount}
        </span>
        <span className="flex items-center gap-1.5">
          <FaComment className="text-base" />
          {item.commentCount}
        </span>
      </div>
    </div>
  );
}

function OrganizerGalleryClient({ organizer }: { organizer: string }) {
  const [viewMode, setViewMode] = useState<"feed" | "grid">("feed");
  const [selectedPost, setSelectedPost] = useState<OrganizerGalleryItem | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-gallery", organizer],
    queryFn: () => getOrganizerGalleryData(organizer),
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-24 pb-12">
        {/* Gallery Social Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8 dark:border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[3px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-lg font-bold text-slate-900 dark:text-white">
                  {organizer.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  @{organizer}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Event moments, photos, and video highlights
                </p>
              </div>
            </div>
          </div>

          {/* View Mode Switcher (Feed vs Grid) */}
          <div className="flex items-center self-start sm:self-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode("feed")}
              aria-label="Feed view"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "feed"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <LuList className="text-base" />
              Feed
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <LuLayoutGrid className="text-base" />
              Grid
            </button>
          </div>
        </header>

        {/* Content Area */}
        {isLoading ? (
          <section className="mt-12">
            <FullPageLoader
              title="Loading gallery moments"
              description="Connecting to feed and fetching photos & videos..."
            />
          </section>
        ) : error || !data ? (
          <section className="mt-12">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't load the organizer gallery."}
              </p>
            </Card>
          </section>
        ) : data.length === 0 ? (
          <section className="mt-12 text-center py-16">
            <LuImage className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No moments published yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Be the first to share a moment from an event below!
            </p>
          </section>
        ) : viewMode === "feed" ? (
          /* Social Media Feed View */
          <section className="mt-10 space-y-8 max-w-xl mx-auto">
            {data.map((item) => (
              <InstagramPostCard key={item.id} item={item} organizer={organizer} />
            ))}
          </section>
        ) : (
          /* Instagram Explore 3-Column Square Grid */
          <section className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {data.map((item) => (
              <GridTile
                key={item.id}
                item={item}
                onClick={() => setSelectedPost(item)}
              />
            ))}
          </section>
        )}

        {/* Attendee Submission Form */}
        <SubmitPhotoSection organizer={organizer} />
      </div>

      {/* Grid Click Lightbox Modal */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg"
          >
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            >
              <LuX className="text-2xl" />
            </button>
            <InstagramPostCard
              item={data?.find((p) => p.id === selectedPost.id) || selectedPost}
              organizer={organizer}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default OrganizerGalleryClient;
