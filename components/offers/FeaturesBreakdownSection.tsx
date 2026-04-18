import Card from "@/components/Card";
import {
  LuChartBarBig,
  LuGlobe,
  LuQrCode,
  LuShieldCheck,
  LuTicketCheck,
  LuUsers,
} from "react-icons/lu";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Branded organizer presence",
    description:
      "Each organizer gets a public-facing identity with landing content, gallery support, event pages, and a cleaner white-label experience.",
    icon: <LuGlobe />,
  },
  {
    title: "Flexible ticket setup",
    description:
      "Create multiple ticket types, manage inventory, and keep sales accurate as orders come in.",
    icon: <LuTicketCheck />,
  },
  {
    title: "Fast verification at the door",
    description:
      "Scan QR tickets, validate instantly, and block duplicate entry without slowing down event check-in.",
    icon: <LuQrCode />,
  },
  {
    title: "Organizer and staff access control",
    description:
      "Run dashboard users with role-based access, session controls, and staff security tools built for live operations.",
    icon: <LuUsers />,
  },
  {
    title: "Sales and attendance visibility",
    description:
      "Track revenue, issued tickets, and check-in activity from the organizer dashboard and admin workspace.",
    icon: <LuChartBarBig />,
  },
  {
    title: "Admin oversight and platform safety",
    description:
      "Approve organizers, review requests, manage users, and keep platform-level governance in place as the network grows.",
    icon: <LuShieldCheck />,
  },
];

function FeaturesBreakdownSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
            Core Capabilities
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built for the full event operation, not just ticket checkout.
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-200 text-2xl text-violet-900 dark:bg-white/10 dark:text-violet-200">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesBreakdownSection;
