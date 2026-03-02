import Accordion, { type AccordionItem } from "@/components/Accordion";

const items: AccordionItem[] = [
  {
    id: "payouts",
    question: "When do I receive payouts?",
    answer:
      "Payout timing depends on your payout settings and event schedule, with reporting available in your dashboard.",
  },
  {
    id: "refunds",
    question: "Can I refund tickets?",
    answer:
      "Yes. Refunds can be processed and the associated ticket is automatically invalidated to prevent entry.",
  },
  {
    id: "security",
    question: "How secure is the QR validation?",
    answer:
      "Each ticket has a unique QR code. Scans are validated instantly and duplicate scans are blocked.",
  },
  {
    id: "export",
    question: "Can I export attendee data?",
    answer:
      "Yes. You can export attendee and sales reports for your records and reconciliation.",
  },
  {
    id: "ticket-types",
    question: "Is there a limit on ticket types?",
    answer:
      "You can create multiple ticket types per event to match your pricing and access needs.",
  },
];

function FaqSection() {
  return (
    <section id="faq" className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          FAQ
        </h2>
        <div className="mt-10">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
