import EventCard from "@/components/EventCard";
import EventPageTitle from "@/components/EventPageTitle";
import { publicDemoEvents } from "@/data/demo";

type Props = {
  params: Promise<{ organizer: string }>;
};

async function Page({ params }: Props) {
  const { organizer } = await params;

  const events = publicDemoEvents.map((event) => ({
    ...event,
    ticketTypes: event.ticketTypes.map((ticket) => ({
      ...ticket,
      buyHref: `/${organizer}/events/${event.id}/checkout`,
    })),
  }));

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
        <EventPageTitle />

        <div className="mt-10 flex flex-col gap-10">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Page;
