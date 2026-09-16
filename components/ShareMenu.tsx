"use client";

import { useState } from "react";
import { LuShare2 } from "react-icons/lu";
import { FaWhatsapp, FaXTwitter, FaFacebook, FaLink } from "react-icons/fa6";

type Props = {
  url: string;
  title: string;
};

function ShareMenu({ url, title }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShareClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled or share failed silently
      }
      return;
    }

    setOpen((current) => !current);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1200);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShareClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        aria-label="Share"
      >
        <LuShare2 className="text-sm" />
      </button>

      {open ? (
        <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-slate-900">
          <a
            href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <FaWhatsapp className="text-base text-emerald-600" />
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <FaXTwitter className="text-base" />
            X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <FaFacebook className="text-base text-blue-600" />
            Facebook
          </a>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <FaLink className="text-base" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ShareMenu;
