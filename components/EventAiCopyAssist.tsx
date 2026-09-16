"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LuSparkles, LuCopy, LuCheck } from "react-icons/lu";

import { generateEventCopy } from "@/helpers/organizer-api";

type GeneratedCopy = {
  description: string;
  tagline: string;
  socialCaption: string;
};

type Props = {
  title: string;
  location?: string;
  onGenerated: (copy: GeneratedCopy) => void;
};

const TONE_OPTIONS = ["professional", "fun", "casual", "formal"] as const;

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const textAreaStyles =
  "min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
        >
          {copied ? <LuCheck className="text-sm" /> : <LuCopy className="text-sm" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function EventAiCopyAssist({ title, location, onGenerated }: Props) {
  const [highlights, setHighlights] = useState("");
  const [tone, setTone] = useState<(typeof TONE_OPTIONS)[number]>("professional");
  const [result, setResult] = useState<GeneratedCopy | null>(null);

  const generateMutation = useMutation({
    mutationFn: () =>
      generateEventCopy({
        title: title.trim(),
        highlights: highlights.trim() || undefined,
        tone,
        location: location?.trim() || undefined,
      }),
    onSuccess: (copy) => {
      setResult(copy);
      onGenerated(copy);
    },
  });

  const canGenerate = title.trim().length >= 4 && !generateMutation.isPending;

  return (
    <div className="space-y-4 rounded-2xl border border-purple-200/70 bg-purple-50/50 p-5 dark:border-purple-400/20 dark:bg-purple-500/[0.06]">
      <div className="flex items-center gap-2">
        <LuSparkles className="text-lg text-purple-700 dark:text-purple-300" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          AI Copy Assist
        </h3>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300">
        Add a few highlights and let AI draft a description, tagline, and social caption from your event
        title{title.trim().length < 4 ? " (enter a title first)" : ""}.
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-900 dark:text-white">
            Highlights (optional)
          </label>
          <textarea
            value={highlights}
            onChange={(event) => setHighlights(event.target.value)}
            className={textAreaStyles}
            placeholder="Live DJ, free drinks, guest speakers..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-900 dark:text-white">
            Tone
          </label>
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as (typeof TONE_OPTIONS)[number])}
            className={inputStyles}
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option[0].toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={!canGenerate}
        onClick={() => generateMutation.mutate()}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LuSparkles className="text-base" />
        {generateMutation.isPending ? "Generating..." : "Generate with AI"}
      </button>

      {generateMutation.isError ? (
        <p className="text-sm text-rose-600 dark:text-rose-300">
          {generateMutation.error instanceof Error
            ? generateMutation.error.message
            : "We couldn't generate copy right now."}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-3 border-t border-purple-200/70 pt-4 dark:border-purple-400/20">
          <CopyField label="Tagline" value={result.tagline} />
          <CopyField label="Social Caption" value={result.socialCaption} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The description above has been filled into the Description field below.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default EventAiCopyAssist;
