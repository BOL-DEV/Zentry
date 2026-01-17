import Image from "next/image";
import Link from "next/link";
import { LuCalendar, LuMapPin } from "react-icons/lu";

export type TicketType = {
  name: string;
  description?: string;
  price: number;
  remaining: number;
  total: number;
  buyHref?: string;
  buttonLabel?: string;
};

export type EventCardProps = {
  imageUrl: string;
  title: string;
  description?: string;
  dateTimeText: string;
  locationText: string;
  dressCode?: string;
  policies?: string[];
  ticketTypes: TicketType[];
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getSoldPercent(remaining: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const sold = total - remaining;
  return clampPercent(Math.round((sold / total) * 100));
}

function EventCard(events: EventCardProps) {
  const {
    imageUrl,
    title,
    description,
    dateTimeText,
    locationText,
    dressCode,
    policies = [],
    ticketTypes,
  } = events;

  return (
    <section className="w-full  overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-slate-950">
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-72 w-full lg:h-auto lg:w-[44%]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 44vw"
            priority
          />
        </div>

        <div className="flex w-full flex-col gap-6 p-6 lg:w-[56%] lg:p-10">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <LuCalendar className="text-base" />
              {dateTimeText}
            </span>
            <span className="flex items-center gap-2">
              <LuMapPin className="text-base" />
              {locationText}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {description ? (
              <p className="text-base text-slate-600 dark:text-slate-300">
                {description}
              </p>
            ) : null}
          </div>

          {(dressCode || policies.length > 0) && (
            <div className="flex flex-col gap-4">
              {dressCode ? (
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Dress Code
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {dressCode}
                  </p>
                </div>
              ) : null}

              {policies.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Policies
                  </h2>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {policies.map((policy) => (
                      <li key={policy}>{policy}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}

          <div className="h-px w-full bg-slate-200 dark:bg-white/10" />

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Ticket Types
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {ticketTypes.map((ticket) => {
                const soldPercent = getSoldPercent(
                  ticket.remaining,
                  ticket.total
                );

                return (
                  <div
                    key={ticket.name}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {ticket.name}
                      </h3>
                      {ticket.description ? (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {ticket.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-purple-600">
                        ${ticket.price}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      {ticket.remaining} tickets available
                    </p>

                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-purple-600"
                        style={{ width: `${soldPercent}%` }}
                        aria-label={`${soldPercent}% sold`}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      {soldPercent}% sold
                    </p>

                    <div className="mt-4">
                      {ticket.buyHref ? (
                        <Link
                          href={ticket.buyHref}
                          className="flex w-full items-center justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                        >
                          {ticket.buttonLabel ?? "Buy Ticket"}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full cursor-not-allowed rounded-lg bg-purple-600/60 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          {ticket.buttonLabel ?? "Buy Ticket"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventCard;
