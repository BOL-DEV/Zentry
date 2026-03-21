import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

import { organizerDemoEvents } from "@/data/demo";
import TicketVerificationClient from "@/components/TicketVerificationClient";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer, id } = await params;
  const event = organizerDemoEvents.find((item) => item.id === id);

  if (!event) notFound();

  const backHref = `/${organizer}/dashboard`;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <LuArrowLeft className="text-base" />
          Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Verify attendee tickets for check-in
          </p>
        </div>

        <TicketVerificationClient
          eventId={event.id}
          totalSold={event.capacitySold}
        />
      </div>
    </main>
  );
}

export default Page;
