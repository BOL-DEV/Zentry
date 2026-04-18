import Image from "next/image";
import Link from "next/link";

import type { PastEventItem } from "./PastEvent";

function PastEventCard({ event }: { event: PastEventItem }) {
  const { organizerSlug, eventId, imageUrl, title, dateText, metaText, organizerName } = event;
  const href = organizerSlug ? `/${organizerSlug}/events/${eventId}` : "";
  const content = (
    <>
      <Image
        src={imageUrl}
        width={300}
        height={100}
        alt={title}
        className="h-[65%] w-full object-cover"
      />
      <div className="flex flex-col gap-2 px-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{dateText}</p>
        <h2 className="font-bold text-lg dark:text-white">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{metaText}</p>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">
          {organizerName}
        </p>
      </div>
    </>
  );

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-transform hover:scale-105 dark:border-slate-600 dark:bg-slate-800 lg:w-72">
      {href ? (
        <Link className="flex h-full flex-col gap-3 pb-4" href={href}>
          {content}
        </Link>
      ) : (
        <div className="flex h-full flex-col gap-3 pb-4">{content}</div>
      )}
    </div>
  );
}

export default PastEventCard;
