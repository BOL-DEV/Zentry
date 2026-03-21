import Link from "next/link";
import Card from "@/components/Card";
import Image from "next/image";
import { fetchOrganizer } from "@/data/organizer";
import { formatCurrency, formatNumber } from "@/helpers/format";
import {
  LuArrowUpRight,
  LuCalendar,
  LuCircleCheck,
  LuClock,
  LuMapPin,
  LuSparkles,
  LuTicket,
} from "react-icons/lu";

type Props = {
  params: Promise<{ organizer: string }>;
};

function getStartingPrice(prices: number[]) {
  const valid = prices.filter((price) => Number.isFinite(price) && price > 0);
  if (valid.length === 0) return 0;
  return Math.min(...valid);
}

function isProbablyUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

async function Page({ params }: Props) {
  const { organizer } = await params;
  const data = await fetchOrganizer(organizer);
  const featuredEvent = data.upcomingEvents[0];
  const upcomingEvents = data.upcomingEvents
    .filter((event) => event.id !== featuredEvent?.id)
    .slice(0, 3);
  const email = `hello@${organizer}.com`;
  const location = "Lagos, Nigeria";
  const joinedDate = "Jan 2023";

  return (
    <main
      className="bg-purple-100 dark:bg-slate-950/90"
      style={{ ["--primary-color" as never]: data.themeColor }}
    >
      {/* 1) Brand Header (Minimal Hero) */}
      <section className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-purple-200/70 bg-white text-2xl font-bold text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                {isProbablyUrl(data.logo) ? (
                  <Image
                    src={data.logo}
                    alt={`${data.name} logo`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    priority
                  />
                ) : (
                  <span aria-hidden>{data.logo}</span>
                )}
              </div>

              <p className="inline-flex w-fit items-center gap-2 rounded-2xl bg-purple-300 px-4 py-1.5 text-sm font-semibold text-purple-900 dark:bg-white/10 dark:text-purple-200">
                <LuSparkles />
                Professional Event Organizer
              </p>
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              {data.name}
              <span className="block text-[var(--primary-color)]">
                {data.tagline}
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              {data.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="#upcoming"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary-color)] px-5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)]/30"
              >
                View Upcoming Events
              </Link>
              <Link
                href="./gallery"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                View Gallery
                <LuArrowUpRight className="text-base" />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl border border-purple-200/70 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <LuCalendar className="text-[var(--primary-color)]" />
                {formatNumber(data.stats.eventsCount)} Events Hosted
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-purple-200/70 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <LuTicket className="text-[var(--primary-color)]" />
                {formatNumber(data.stats.ticketsSold)} Tickets Sold
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-lg md:h-[420px]">
              <Image
                src={featuredEvent?.imageUrl ?? data.pastEvents[0]?.imageUrl}
                alt={featuredEvent?.title ?? `${data.name} banner`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2) About */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          About
        </h2>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-5">
              <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                {data.description}
              </p>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                We care about the details that make events feel premium: clear
                communication, friendly onboarding, and a smooth on-site flow.
                If you’re attending, expect a well-structured schedule and a
                comfortable venue. If you’re partnering, expect fast replies and
                clean deliverables.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-purple-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <LuCircleCheck className="mt-0.5 text-[var(--primary-color)]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Curated lineups
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Speakers, sessions, and activities picked with intent.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-purple-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <LuCircleCheck className="mt-0.5 text-[var(--primary-color)]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Smooth entry
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Check-in designed to keep lines moving.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-purple-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <LuCircleCheck className="mt-0.5 text-[var(--primary-color)]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Clear updates
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Schedules, locations, and policies kept simple.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-purple-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <LuCircleCheck className="mt-0.5 text-[var(--primary-color)]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Community-first
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Welcoming environments and respectful guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-2 block font-semibold text-[var(--primary-color)] hover:opacity-90"
                  >
                    {email}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                    Location
                  </p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                    {location}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                    Joined
                  </p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                    {joinedDate}
                  </p>
                </div>

                {/* Social removed per request */}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3) Featured Event */}
      {featuredEvent ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Featured Event
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                The next big thing—don’t miss it.
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-purple-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-0 lg:grid-cols-12">
              <div className="relative h-64 w-full lg:col-span-5 lg:h-full">
                <Image
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              </div>
              <div className="p-6 lg:col-span-7 lg:p-10">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <LuClock className="text-[var(--primary-color)]" />
                    {featuredEvent.dateTimeText}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <LuMapPin className="text-[var(--primary-color)]" />
                    {featuredEvent.locationText}
                  </span>
                </div>

                <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {featuredEvent.title}
                </h3>
                {featuredEvent.description ? (
                  <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                    {featuredEvent.description}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/${organizer}/events/${featuredEvent.id}/checkout`}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary-color)] px-5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary-color)]/30"
                  >
                    Get Tickets
                  </Link>
                  <Link
                    href={`/${organizer}/events/${featuredEvent.id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    View Details
                    <LuArrowUpRight className="text-base" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4) Upcoming Events (Grid) */}
      <section id="upcoming" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Upcoming Events
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Browse what’s next and secure your spot.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => {
            const startingPrice = getStartingPrice(
              event.ticketTypes.map((ticket) => ticket.price),
            );

            return (
              <Card key={event.id} className="p-0 overflow-hidden">
                <div className="relative h-44 w-full">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    {event.title}
                  </h3>

                  <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <LuCalendar className="text-[var(--primary-color)]" />
                      {event.dateTimeText}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <LuMapPin className="text-[var(--primary-color)]" />
                      {event.locationText}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {startingPrice > 0
                        ? `From ${formatCurrency(startingPrice)}`
                        : "Free"}
                    </p>
                    <Link
                      href={`/${organizer}/events/${event.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary-color)] hover:opacity-90"
                    >
                      View Details
                      <LuArrowUpRight className="text-base" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="./events"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-purple-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Browse Events
          </Link>
        </div>
      </section>

      {/* 5) Past Events (Subtle) */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Past Events
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            A few highlights from previous editions.
          </p>
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
          {data.pastEvents.map((event) => (
            <div key={event.id} className="min-w-[280px]">
              <Card className="p-0 overflow-hidden">
                <Link
                  href="./gallery"
                  aria-label={`View ${event.title} images`}
                  className="group block"
                >
                  <div className="relative h-36 w-full">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      sizes="280px"
                    />
                    <div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/10" />
                    <div className="absolute bottom-3 left-3 rounded-lg bg-[var(--primary-color)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      View gallery
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300">
                    {event.dateText}
                  </p>
                  <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {formatNumber(event.ticketsSold)} tickets sold
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Page;
