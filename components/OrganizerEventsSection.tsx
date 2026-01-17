'use client';
import OrganizerEventCard from './OrganizerEventCard';


export type TicketTypeBreak = {
  name: string;
  price: number;
  sold: number;
  total: number;
};

export type OrganizerEvent = {
  id: string;
  title: string;
  dateTimeText: string;
  capacitySold: number;
  capacityTotal: number;
  revenue: number;
  checkIns: number;
  ticketTypesCount: number;
  ticketTypes: TicketTypeBreak[];
};


const demoEvents: OrganizerEvent[] = [
  {
    id: 'tech-summit-2025',
    title: 'Tech Summit 2025',
    dateTimeText: 'June 15, 2025 at 09:00 AM',
    capacitySold: 1045,
    capacityTotal: 1600,
    revenue: 196_455,
    checkIns: 470,
    ticketTypesCount: 3,
    ticketTypes: [
      { name: 'VIP Pass', price: 299, sold: 45, total: 100 },
      { name: 'Early Bird', price: 149, sold: 320, total: 500 },
      { name: 'Regular', price: 199, sold: 680, total: 1000 },
    ],
  },
  {
    id: 'design-workshop',
    title: 'Design Workshop',
    dateTimeText: 'May 20, 2025 at 02:00 PM',
    capacitySold: 622,
    capacityTotal: 850,
    revenue: 102_128,
    checkIns: 279,
    ticketTypesCount: 3,
    ticketTypes: [
      { name: 'VIP Pass', price: 199, sold: 22, total: 50 },
      { name: 'Early Bird', price: 99, sold: 240, total: 350 },
      { name: 'Regular', price: 149, sold: 360, total: 450 },
    ],
  },
  {
    id: 'startup-networking-mixer',
    title: 'Startup Networking Mixer',
    dateTimeText: 'May 10, 2025 at 06:00 PM',
    capacitySold: 425,
    capacityTotal: 575,
    revenue: 22_175,
    checkIns: 191,
    ticketTypesCount: 2,
    ticketTypes: [
      { name: 'VIP Pass', price: 79, sold: 30, total: 75 },
      { name: 'Regular', price: 49, sold: 395, total: 500 },
    ],
  },
];





function OrganizerEventsSection({ events = demoEvents }: { events?: OrganizerEvent[] }) {
  return (
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto lg:max-w-7xl px-6 pb-14">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Your Events
        </h2>

        <div className="mt-6 space-y-6">
          {events.map((event) => (
            <OrganizerEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default OrganizerEventsSection;
