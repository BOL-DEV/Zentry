"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LuX, LuSend, LuMessageCircle } from "react-icons/lu";
import { getGalleryComments, createGalleryComment } from "@/helpers/organizer-api";
import type { OrganizerGalleryItem, ApiGalleryComment } from "@/helpers/type";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  organizer: string;
  item: OrganizerGalleryItem;
};

function formatTimeAgo(dateString: string): string {
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function GalleryCommentsModal({
  isOpen,
  onClose,
  organizer,
  item,
}: Props) {
  const queryClient = useQueryClient();
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["gallery-comments", organizer, item.id],
    queryFn: () => getGalleryComments(organizer, item.id),
    enabled: isOpen,
  });

  const commentMutation = useMutation({
    mutationFn: () => {
      const name = authorName.trim() || "Event Attendee";
      const text = commentText.trim();
      if (!text) throw new Error("Comment cannot be empty");
      return createGalleryComment(organizer, item.id, {
        authorName: name,
        text,
      });
    },
    onSuccess: () => {
      setCommentText("");
      setErrorMessage("");
      void queryClient.invalidateQueries({
        queryKey: ["gallery-comments", organizer, item.id],
      });
      void queryClient.invalidateQueries({
        queryKey: ["organizer-gallery", organizer],
      });
    },
    onError: (err) => {
      setErrorMessage(err instanceof Error ? err.message : "Failed to post comment");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div
        className="flex h-[85vh] sm:h-[680px] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <LuMessageCircle className="text-xl text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Comments ({comments.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        {/* Caption Header as main post note */}
        {item.description && (
          <div className="flex gap-3 border-b border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-xs font-bold text-white shadow-sm">
              {organizer.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  @{organizer}
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  Organizer
                </span>
                <span className="text-[11px] text-slate-400">{item.dateText}</span>
              </div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {item.description}
              </p>
            </div>
          </div>
        )}

        {/* Comments Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="flex h-52 flex-col items-center justify-center text-center p-6">
              <LuMessageCircle className="text-4xl text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                No comments yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Be the first to share your thoughts on this event moment!
              </p>
            </div>
          ) : (
            comments.map((comment: ApiGalleryComment) => (
              <div key={comment._id} className="flex gap-3 items-start group">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${comment.isOrganizer
                      ? "bg-gradient-to-tr from-purple-600 to-pink-500"
                      : "bg-slate-700 dark:bg-slate-800"
                    }`}
                >
                  {comment.authorName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {comment.authorName}
                    </span>
                    {comment.isOrganizer && (
                      <span className="rounded-full bg-purple-100 px-1.5 py-0.2 text-[9px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        Organizer
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200 break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Input Footer */}
        <div className="border-t border-slate-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          {errorMessage && (
            <p className="mb-2 text-xs text-rose-500">{errorMessage}</p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (commentText.trim()) {
                commentMutation.mutate();
              }
            }}
            className="flex flex-col gap-2"
          >
            <input
              type="text"
              placeholder="Your name (optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition focus:border-purple-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || commentMutation.isPending}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LuSend className="text-base" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

