"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { LuMessageCircle } from "react-icons/lu";
import ShareMenu from "@/components/ShareMenu";
import GalleryMediaViewer from "@/components/GalleryMediaViewer";
import GalleryCommentsModal from "@/components/GalleryCommentsModal";
import { likeGalleryPhoto, createGalleryComment } from "@/helpers/organizer-api";
import type { OrganizerGalleryItem, ApiGalleryComment } from "@/helpers/type";

type Props = {
  item: OrganizerGalleryItem;
  organizer: string;
};

export default function InstagramPostCard({ item, organizer }: Props) {
  const queryClient = useQueryClient();
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [hasLiked, setHasLiked] = useState(item.hasLiked);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [quickComment, setQuickComment] = useState("");
  const [showFullCaption, setShowFullCaption] = useState(false);
  useEffect(() => {
    setLikeCount(item.likeCount);
    setHasLiked(item.hasLiked);
  }, [item.likeCount, item.hasLiked]);


  const likeMutation = useMutation({
    mutationFn: () => likeGalleryPhoto(organizer, item.id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["organizer-gallery", organizer],
      });

      const prevLiked = hasLiked;
      const prevCount = likeCount;
      const nextLiked = !prevLiked;
      const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

      setHasLiked(nextLiked);
      setLikeCount(nextCount);

      return { prevLiked, prevCount };
    },
    onError: (_err, _vars, context) => {
      if (context) {
        setHasLiked(context.prevLiked);
        setLikeCount(context.prevCount);
      }
    },
    onSuccess: (result) => {
      setLikeCount(result.likeCount);
      setHasLiked(result.hasLiked);
      void queryClient.invalidateQueries({
        queryKey: ["organizer-gallery", organizer],
      });
    },
  });

  const quickCommentMutation = useMutation({
    mutationFn: (text: string) =>
      createGalleryComment(organizer, item.id, {
        authorName: "Attendee",
        text,
      }),
    onSuccess: () => {
      setQuickComment("");
      void queryClient.invalidateQueries({
        queryKey: ["organizer-gallery", organizer],
      });
      void queryClient.invalidateQueries({
        queryKey: ["gallery-comments", organizer, item.id],
      });
    },
  });

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${organizer}/gallery#post-${item.id}`
      : "";

  const captionLimit = 120;
  const isCaptionLong = (item.description || "").length > captionLimit;

  return (
    <article
      id={`post-${item.id}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/90 transition-all"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white">
              {organizer.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                @{organizer}
              </span>
              {item.submittedByName && (
                <span className="text-xs text-slate-400">
                  via {item.submittedByName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {item.dateText}
            </p>
          </div>
        </div>

        <ShareMenu url={shareUrl} title={item.title} />
      </div>

      {/* Media Carousel / Video Player */}
      <GalleryMediaViewer
        media={item.media}
        altText={item.altText || item.title}
        onDoubleTapHeart={() => {
          if (!hasLiked) {
            likeMutation.mutate();
          }
        }}
      />

      {/* Action Buttons Row */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              aria-label={hasLiked ? "Unlike" : "Like"}
              className="inline-flex items-center gap-1.5 transition transform active:scale-125 focus:outline-none"
            >
              {hasLiked ? (
                <FaHeart className="text-2xl text-rose-500 transition-all duration-200" />
              ) : (
                <FaRegHeart className="text-2xl text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition-all duration-200" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCommentsOpen(true)}
              aria-label="View comments"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white transition transform active:scale-125 focus:outline-none"
            >
              <LuMessageCircle className="text-2xl" />
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {item.media.length > 1 ? `${item.media.length} items` : null}
          </div>
        </div>

        {/* Like count */}
        <div className="mt-2.5">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {likeCount === 0
              ? "Be the first to like this"
              : likeCount === 1
                ? "1 like"
                : `${likeCount.toLocaleString()} likes`}
          </p>
        </div>

        {/* Caption */}
        {item.description && (
          <div className="mt-1.5 text-sm text-slate-800 dark:text-slate-200 leading-snug">
            <span className="font-bold mr-1.5 text-slate-900 dark:text-white">
              @{organizer}
            </span>
            {isCaptionLong && !showFullCaption
              ? `${item.description.slice(0, captionLimit)}... `
              : item.description}
            {isCaptionLong && (
              <button
                type="button"
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-1"
              >
                {showFullCaption ? "less" : "more"}
              </button>
            )}
          </div>
        )}

        {/* Recent Comments Preview */}
        {item.commentCount > 0 && (
          <div className="mt-2">
            {item.commentCount > 2 && (
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                View all {item.commentCount} comments
              </button>
            )}

            <div className="mt-1 space-y-1">
              {(item.recentComments || []).map((c: ApiGalleryComment) => (
                <p key={c._id} className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold mr-1.5 text-slate-900 dark:text-white">
                    {c.authorName}
                  </span>
                  {c.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Quick inline comment input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (quickComment.trim()) {
              quickCommentMutation.mutate(quickComment.trim());
            }
          }}
          className="mt-3 flex items-center border-t border-slate-100 pt-3 dark:border-white/5"
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={quickComment}
            onChange={(e) => setQuickComment(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400"
          />
          {quickComment.trim() && (
            <button
              type="submit"
              disabled={quickCommentMutation.isPending}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 disabled:opacity-50"
            >
              Post
            </button>
          )}
        </form>
      </div>

      {/* Full Comments Modal */}
      <GalleryCommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        organizer={organizer}
        item={item}
      />
    </article>
  );
}

