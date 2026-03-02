import Card from "@/components/Card";
import {
  LuChartBarBig,
  LuMail,
  LuQrCode,
  LuShieldCheck,
  LuTicketCheck,
  LuUndo2,
} from "react-icons/lu";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    title: "Smart Ticket Inventory Control",
    description: "Create multiple ticket types and keep availability accurate in real time.",
    icon: <LuTicketCheck />,
  },
  {
    title: "Real-Time Check-In Monitoring",
    description: "Track entries live and spot issues instantly as doors open.",
    icon: <LuQrCode />,
  },
  {
    title: "Revenue Analytics Dashboard",
    description: "See sales performance and revenue as tickets move.",
    icon: <LuChartBarBig />,
  },
  {
    title: "Automated Ticket Emails",
    description: "Send tickets automatically with a unique QR code per attendee.",
    icon: <LuMail />,
  },
  {
    title: "Refund & Ticket Invalidation System",
    description: "Refunded tickets are invalidated to protect your entry flow.",
    icon: <LuUndo2 />,
  },
  {
    title: "Admin Oversight Controls",
    description: "Operate with clear oversight tools and secure controls.",
    icon: <LuShieldCheck />,
  },
];

function FeaturesBreakdownSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          What You Get
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="h-full">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-purple-300 text-2xl text-purple-900 dark:bg-white/10 dark:text-purple-200">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {f.description}
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
