"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import Card from "@/components/Card";
import { getOrganizerGalleryData } from "@/helpers/organizer-api";
import type { OrganizerGalleryItem } from "@/helpers/type";

function GalleryCard({ item }: { item: OrganizerGalleryItem }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="relative h-80 w-full">
        <Image
          src={item.imageUrl}
          alt={item.altText}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-end gap-4">
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {item.dateText}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {item.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {item.description}
        </p>
      </div>
    </article>
  );
}

function OrganizerGalleryClient({ organizer }: { organizer: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-gallery", organizer],
    queryFn: () => getOrganizerGalleryData(organizer),
  });

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
        <header className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Event Gallery
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            Explore stunning moments and memories from our past events.
          </p>
        </header>

        {isLoading ? (
          <section className="mt-10">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Loading gallery...
              </p>
            </Card>
          </section>
        ) : error || !data ? (
          <section className="mt-10">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't load the organizer gallery."}
              </p>
            </Card>
          </section>
        ) : data.length === 0 ? (
          <section className="mt-10">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No gallery images have been published for this organizer yet.
              </p>
            </Card>
          </section>
        ) : (
          <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <GalleryCard key={item.id} item={item} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default OrganizerGalleryClient;
