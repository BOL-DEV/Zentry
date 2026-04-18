"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { getOrganizerGalleryItemsForEdit } from "@/helpers/organizer-api";

function OrganizerManageGalleryClient({ organizer }: { organizer: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-gallery-manage", organizer],
    queryFn: () => getOrganizerGalleryItemsForEdit(organizer),
  });

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Organizer Workspace"
          title="Manage Gallery"
          description="Update your organizer gallery."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
        />

        <div className="mt-6 flex justify-end">
          <Link
            href={`/${organizer}/dashboard/gallery/create`}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Add Gallery Image
          </Link>
        </div>

        {isLoading ? (
          <section className="mt-8">
            <FullPageLoader
              title="Loading gallery items"
              description="Loading your gallery images."
            />
          </section>
        ) : error || !data ? (
          <section className="mt-8">
            <Card>
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {error instanceof Error
                  ? error.message
                  : "We couldn't load the organizer gallery."}
              </p>
            </Card>
          </section>
        ) : data.length === 0 ? (
          <section className="mt-8">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No gallery images have been added yet.
              </p>
            </Card>
          </section>
        ) : (
          <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="relative h-72 w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.altText || item.caption || "Gallery image"}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>

                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Display Order {item.displayOrder}
                  </p>
                  <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                    {item.caption || "Untitled gallery image"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {item.altText || "No alt text set."}
                  </p>

                  <div className="mt-5">
                    <Link
                      href={`/${organizer}/dashboard/gallery/${item._id}/edit`}
                      className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      Edit Image
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default OrganizerManageGalleryClient;
