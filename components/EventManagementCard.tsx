import { formatCurrency, formatNumber } from "@/helpers/format";
import { LuPencil, LuTrash2 } from "react-icons/lu";


interface Props {
    event: {
        id: string;
        title: string;
        dateText: string;
        locationText: string;
        ticketsSold: number;
        revenue: number;
    };
}

function EventManagementCard(props: Props) {
    const { event } = props
    return (
      <article
        key={event.id}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950"
      >
        <div className="flex items-start justify-between gap-6 p-6">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {event.title}
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Date
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {event.dateText}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Location
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {event.locationText}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tickets Sold
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatNumber(event.ticketsSold)}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Revenue
                </div>
                <div className="mt-1 text-sm font-semibold text-purple-700 dark:text-purple-400">
                  {formatCurrency(event.revenue)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-none items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:bg-purple-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              aria-label={`Edit ${event.title}`}
            >
              <LuPencil className="text-lg" />
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 active:scale-[0.99] dark:border-red-500/30 dark:bg-white/5 dark:text-red-400 dark:hover:bg-white/10"
              aria-label={`Delete ${event.title}`}
            >
              <LuTrash2 className="text-lg" />
            </button>
          </div>
        </div>
      </article>
    );
}

export default EventManagementCard
