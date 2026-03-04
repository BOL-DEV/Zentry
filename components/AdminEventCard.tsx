import Image from "next/image";
import Link from "next/link";
import { LuCalendar, LuMapPin } from "react-icons/lu";
import { publicDemoEvents as events } from "@/data/demo";

interface Props {
  event: typeof events[0];
}

function AdminEventCard(props: Props) {
    const { event } = props
    
function getStartingPrice(ticketTypes: { price: number }[]) {
  const paidTickets = ticketTypes
    .map((t) => t.price)
    .filter((price) => Number.isFinite(price) && price > 0);

  if (paidTickets.length === 0) return 0;
  return Math.min(...paidTickets);
    }
    
            const startingPrice = getStartingPrice(event.ticketTypes);


    return (
      <article
        key={`${event.title}-${event.dateTimeText}`}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <div className="relative h-48 w-full">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />

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

          <p className="mt-4 text-lg font-semibold text-purple-700 dark:text-purple-400">
            Starting ${startingPrice}
          </p>

          <Link
            href={`/events/${event.id}`}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            View Details
          </Link>
        </div>
      </article>
    );
}

export default AdminEventCard
