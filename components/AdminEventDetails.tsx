import Image from "next/image";
import Link from "next/link";
import { LuArrowLeft, LuCalendar, LuClock, LuMapPin, LuUser } from "react-icons/lu";
import { formatCurrency } from "@/helpers/format";
import type { EventCardProps, TicketType } from "@/helpers/type";

type OrganizerInfo = {
  name: string;
  tagline: string;
  profileHref: string;
};

type Props = {
  event: EventCardProps;
  backHref?: string;
  statusLabel?: string;
  organizer?: OrganizerInfo;
  organizerSlug?: string;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getSoldCount(remaining: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, total - remaining);
}

function getSoldPercent(remaining: number, total: number) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return clampPercent(Math.round((getSoldCount(remaining, total) / total) * 100));
}

function splitDateAndTime(dateTimeText: string) {
  const trimmed = dateTimeText.trim();

  const bulletParts = trimmed.split("•").map((p) => p.trim()).filter(Boolean);
  if (bulletParts.length >= 2) {
    return {
      dateText: bulletParts[0],
      timeText: bulletParts.slice(1).join(" • "),
    };
  }

  const atParts = trimmed.split(/\s+at\s+/i).map((p) => p.trim()).filter(Boolean);
  if (atParts.length >= 2) {
    return {
      dateText: atParts[0],
      timeText: atParts.slice(1).join(" at "),
    };
  }

  return { dateText: trimmed, timeText: "" };
}

function TicketCard({
  ticket,
  buyHrefOverride,
}: {
  ticket: TicketType;
  buyHrefOverride?: string;
}) {
  const sold = getSoldCount(ticket.remaining, ticket.total);
  const soldPercent = getSoldPercent(ticket.remaining, ticket.total);
  const buyHref =
    buyHrefOverride && ticket.id
      ? `${buyHrefOverride}?ticketTypeId=${ticket.id}`
      : buyHrefOverride ?? ticket.buyHref;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {ticket.name}
        </h3>
      </div>

      <p className="mt-2 text-4xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
        {formatCurrency(ticket.price)}
      </p>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        Remaining: {ticket.remaining}
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-purple-600"
          style={{ width: `${soldPercent}%` }}
          aria-label={`${soldPercent}% sold`}
        />
      </div>

      {Number.isFinite(ticket.total) && ticket.total > 0 ? (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {sold} / {ticket.total} sold
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sold data unavailable</p>
      )}

      <div className="mt-6">
        {buyHref ? (
          <Link
            href={buyHref}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            {ticket.buttonLabel ?? "Buy Ticket"}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="h-12 w-full cursor-not-allowed rounded-xl bg-purple-600/60 px-4 text-sm font-semibold text-white"
          >
            {ticket.buttonLabel ?? "Buy Ticket"}
          </button>
        )}
      </div>
    </div>
  );
}

function OrganizerCard({ organizer }: { organizer: OrganizerInfo }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-purple-600 text-white">
            <LuUser className="h-7 w-7" />
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {organizer.name}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{organizer.tagline}</p>
          </div>
        </div>

        <Link
          href={organizer.profileHref}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-purple-600 px-5 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          View Organizer Profile
        </Link>
      </div>
    </div>
  );
}

function AdminEventDetails({
  event,
  backHref = "/events",
  statusLabel = "Upcoming",
  organizer = {
    name: "Pulse Events",
    tagline: "Creating Unforgettable Experiences",
    profileHref: "#",
  },
  organizerSlug = "pulse-events",
}: Props) {
  const { dateText, timeText } = splitDateAndTime(event.dateTimeText);
  const organizerCheckoutHref = `/${organizerSlug}/events/${event.id}/checkout`;

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-24 pb-16">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <LuArrowLeft className="text-base" />
          Back to Events
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="relative h-90 w-full">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/55 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                {statusLabel}
              </span>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {event.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2">
                  <LuCalendar className="text-base" />
                  {dateText}
                </span>
                {timeText ? (
                  <span className="inline-flex items-center gap-2">
                    <LuClock className="text-base" />
                    {timeText}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2">
                  <LuMapPin className="text-base" />
                  {event.locationText}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">About this Event</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {event.description ??
                  "Join industry leaders for a day of innovation and networking. This event features keynotes, workshops, and sessions designed to inspire and connect."}
              </p>

              {event.dressCode ? (
                <div className="mt-7">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Dress Code</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.dressCode}</p>
                </div>
              ) : null}

              {event.policies && event.policies.length > 0 ? (
                <div className="mt-7">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Event Policies</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {event.policies.map((policy) => (
                      <li key={policy}>{policy}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Info</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <LuCalendar className="text-base" />
                  {dateText}
                </p>
                {timeText ? (
                  <p className="flex items-center gap-2">
                    <LuClock className="text-base" />
                    {timeText}
                  </p>
                ) : null}
                <p className="flex items-center gap-2">
                  <LuMapPin className="text-base" />
                  {event.locationText}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Choose Your Ticket
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {event.ticketTypes.slice(0, 3).map((ticket) => (
              <TicketCard
                key={ticket.name}
                ticket={ticket}
                buyHrefOverride={ticket.buyHref ? organizerCheckoutHref : undefined}
              />
            ))}
          </div>

          <div className="mt-10">
            <OrganizerCard organizer={organizer} />
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminEventDetails;
