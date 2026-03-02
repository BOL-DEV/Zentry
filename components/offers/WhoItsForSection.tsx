import Card from "@/components/Card";

type Audience = {
  title: string;
  description: string;
};

const audiences: Audience[] = [
  {
    title: "Concert Organizers",
    description: "Sell tickets fast and keep entry moving smoothly.",
  },
  {
    title: "Campus Events",
    description: "Run club nights, shows, and student programs with control.",
  },
  {
    title: "Conferences",
    description: "Handle multi-ticket entry and attendee tracking at scale.",
  },
  {
    title: "Corporate Events",
    description: "Validate attendance and report outcomes with confidence.",
  },
  {
    title: "Religious Programs",
    description: "Manage registrations and secure check-in for large gatherings.",
  },
];

function WhoItsForSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Who It’s For
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a) => (
            <Card key={a.title} className="h-full">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {a.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {a.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhoItsForSection;
