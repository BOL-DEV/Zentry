import Accordion, { type AccordionItem } from "@/components/Accordion";

const items: AccordionItem[] = [
  {
    id: "organizer-approval",
    question: "How do organizers join the platform?",
    answer:
      "Organizers submit a request first. Admin reviews the application, and only approved requests become real organizer accounts with dashboard access.",
  },
  {
    id: "branding",
    question: "Can organizers have their own branded presence?",
    answer:
      "Yes. The platform supports organizer-specific branding, public landing content, event pages, gallery content, and profile details that make each organizer feel distinct.",
  },
  {
    id: "verification",
    question: "How does ticket verification work?",
    answer:
      "Each valid ticket carries a QR code and verification happens against the backend in real time. Duplicate scans can be blocked so entry staff can trust the result on screen.",
  },
  {
    id: "staff",
    question: "Can organizers manage staff access?",
    answer:
      "Yes. Organizers can manage dashboard users, review staff sessions, and control staff security through the dashboard tools already built into the platform.",
  },
  {
    id: "admin-oversight",
    question: "What does admin control across the platform?",
    answer:
      "Admin has a separate auth flow and oversight workspace for organizer approvals, events, tickets, orders, dashboard users, and session policies.",
  },
];

function FaqSection() {
  return (
    <section id="faq" className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-600 dark:text-violet-300">
          FAQ
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Questions organizers usually ask before onboarding.
        </h2>
        <div className="mt-10">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
