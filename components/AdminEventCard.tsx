"use client";

import Link from "next/link";
import { useState } from "react";
import { LuCalendar, LuMapPin } from "react-icons/lu";
import type { AdminEventListItem } from "@/helpers/type";

interface Props {
  event: AdminEventListItem;
}

function AdminEventCard(props: Props) {
  const { event } = props;
  const [imageFailed, setImageFailed] = useState(false);
  const detailsHref = event.organizerSlug
    ? `/${event.organizerSlug}/events/${event.id}`
    : undefined;


  return (
    <article
      key={`${event.title}-${event.dateTimeText}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="relative h-48 w-full">
        {imageFailed || !event.imageUrl ? (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-200 via-slate-100 to-white text-sm font-semibold text-slate-500 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 dark:text-slate-300">
            Event Poster Unavailable
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}

        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          Upcoming
        </span>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {event.title}
        </h2>

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="flex items-center gap-2">
            <LuCalendar className="text-base" />
            {event.dateTimeText}
          </p>
          <p className="flex items-center gap-2">
            <LuMapPin className="text-base" />
            {event.locationText}
          </p>
        </div>

        <div className="mt-5 h-px w-full bg-slate-200 dark:bg-white/10" />

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300"> 
          {event.organizerSlug || event.organizerName} 
        </p> 

        {detailsHref ? (
          <Link
            href={detailsHref}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            View Details
          </Link>
        ) : (
          <div className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-200 px-4 text-sm font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">
            Event details unavailable
          </div>
        )}
      </div>
    </article>
  );
}

export default AdminEventCard;
