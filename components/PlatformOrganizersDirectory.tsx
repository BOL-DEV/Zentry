import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight, LuMail, LuMapPin, LuPhone, LuSparkles } from "react-icons/lu";

import type { ApiOrganizer } from "@/helpers/type";

function fallbackBanner(name: string) {
  const encodedName = encodeURIComponent(name);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f172a"/><stop offset="55%" stop-color="%235b21b6"/><stop offset="100%" stop-color="%2306b6d4"/></linearGradient></defs><rect width="1200" height="700" fill="url(%23bg)"/><circle cx="220" cy="120" r="180" fill="%23ffffff12"/><circle cx="980" cy="540" r="220" fill="%23ffffff10"/><text x="90" y="560" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="%23ffffff">${encodedName}</text></svg>`;
}

function fallbackLogo(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2318b7ff"/><stop offset="100%" stop-color="%238b5cf6"/></linearGradient></defs><rect width="240" height="240" rx="48" fill="url(%23g)"/><text x="120" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="78" font-weight="700" fill="%23ffffff">${initials || "Z"}</text></svg>`;
}

function shouldDisableImageOptimization(src: string) {
  return src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://");
}

function OrganizerCard({ organizer }: { organizer: ApiOrganizer }) {
  const bannerSrc = organizer.bannerUrl || fallbackBanner(organizer.name);
  const logoSrc = organizer.logoUrl || fallbackLogo(organizer.name);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-purple-200/70 bg-white/90 shadow-[0_22px_60px_rgba(88,28,135,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(88,28,135,0.16)] dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,15,28,0.98),rgba(5,10,20,0.98))] dark:shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={bannerSrc}
          alt={`${organizer.name} banner`}
          fill
          unoptimized={shouldDisableImageOptimization(bannerSrc)}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/35 to-transparent dark:from-[#020617]/95 dark:via-[#020617]/30" />
        <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-900 shadow-sm dark:border dark:border-white/10 dark:bg-black/35 dark:text-cyan-100 dark:backdrop-blur">
          <LuSparkles className="text-xs" />
          Organizer
        </div>
      </div>

      <div className="relative px-6 pb-6">
        <div className="-mt-12 flex items-end justify-between gap-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-[26px] border-4 border-white bg-white shadow-lg dark:border-[#081121] dark:bg-[#0b1628] dark:shadow-[0_14px_30px_rgba(0,0,0,0.35)]">
            <Image
              src={logoSrc}
              alt={`${organizer.name} logo`}
              fill
              unoptimized={shouldDisableImageOptimization(logoSrc)}
              className="object-cover"
            />
          </div>

          <Link
            href={`/${organizer.slug}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:border dark:border-cyan-400/20 dark:bg-cyan-400/12 dark:text-cyan-100 dark:hover:bg-cyan-400/18"
          >
            View Organizer
            <LuArrowUpRight className="text-base" />
          </Link>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700 dark:text-cyan-300">
            @{organizer.slug}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {organizer.name}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {organizer.heroSubtitle ||
              organizer.about ||
              "Discover upcoming experiences from this organizer."}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/8 dark:bg-white/4">
            <LuMapPin className="mt-0.5 text-base text-cyan-600 dark:text-cyan-300" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Location
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                {organizer.location || "Location unavailable"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/8 dark:bg-white/4">
              <div className="flex items-start gap-3">
                <LuMail className="mt-0.5 text-base text-purple-600 dark:text-purple-300" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-white">
                    {organizer.contactEmail || "Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/8 dark:bg-white/4">
              <div className="flex items-start gap-3">
                <LuPhone className="mt-0.5 text-base text-emerald-600 dark:text-emerald-300" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Phone
                  </p>
                  <p className="mt-1 break-all text-sm font-medium text-slate-900 dark:text-white">
                    {organizer.contactPhone || "Unavailable"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function PlatformOrganizersDirectory({
  organizers,
}: {
  organizers: ApiOrganizer[];
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f3e8ff_0%,#efe4ff_40%,#f8f7ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#050b1a_45%,#020617_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.16),transparent_34%),radial-gradient(circle_at_right,rgba(34,211,238,0.12),transparent_30%)]" />

      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-purple-300">
            <LuSparkles className="text-sm" />
            Organizer Directory
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            Explore the teams behind the experiences on Zentry.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Browse organizer profiles, discover who is hosting next, and jump
            straight into each organizer&apos;s public event space.
          </p>
        </div>

        {organizers.length > 0 ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {organizers.map((organizer) => (
              <OrganizerCard
                key={organizer._id || organizer.slug}
                organizer={organizer}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-[28px] border border-slate-200 bg-white/85 p-10 text-center shadow-sm dark:border-white/10 dark:bg-slate-950/85">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              No organizers yet
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Organizer profiles will appear here as soon as they are available
              on the platform.
            </p>
            <Link
              href="/organizer-request"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Apply as Organizer
              <LuArrowUpRight className="text-base" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default PlatformOrganizersDirectory;
