import Card from "@/components/Card";

type Audience = {
  title: string;
  description: string;
};

const audiences: Audience[] = [
  {
    title: "Concert and nightlife organizers",
    description: "Move tickets fast and keep entry control tight when crowd pressure is high.",
  },
  {
    title: "Campus and youth-led events",
    description: "Run recurring programs with branded visibility, staff access, and cleaner check-in.",
  },
  {
    title: "Conferences and summits",
    description: "Support multiple ticket tiers, attendee verification, and organized event operations.",
  },
  {
    title: "Corporate and brand activations",
    description: "Keep attendance, validation, and reporting polished for clients and internal teams.",
  },
  {
    title: "Religious and community gatherings",
    description: "Handle large turnout with more structure across registration, access, and verification.",
  },
  {
    title: "Multi-organizer event platforms",
    description: "Operate a controlled network where admin oversight and organizer branding both matter.",
  },
];

function WhoItsForSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
            Best Fit
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built for teams that treat events like operations, not guesswork.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience) => (
            <Card key={audience.title} className="h-full">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {audience.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhoItsForSection;
