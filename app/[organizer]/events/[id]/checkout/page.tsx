import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

import Card from "@/components/Card";
import { publicDemoEvents } from "@/data/demo";
import { formatCurrency } from "@/helpers/format";

type Props = {
  params: Promise<{ organizer: string; id: string }>;
};

async function Page({ params }: Props) {
  const { organizer, id } = await params;
  const event = publicDemoEvents.find((item) => item.id === id);

  if (!event) notFound();

  const selectedTicket =
    event.ticketTypes.find((ticket) => ticket.price > 0) ?? event.ticketTypes[0];

  const quantity = 1;
  const subtotal = (selectedTicket?.price ?? 0) * quantity;
  const serviceFee = subtotal > 0 ? 200 : 0;
  const total = subtotal + serviceFee;

  const inputStyles =
    "h-12 w-full rounded-xl border border-purple-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  const selectStyles = `${inputStyles} pr-10`;

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-linear-to-b from-slate-950/10 via-transparent to-transparent dark:from-white/5" />

        <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-14">
          <Link
            href={`/${organizer}/events`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <LuArrowLeft className="text-base" />
            Back to Events
          </Link>

          <div className="mt-8 max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Secure Checkout
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Complete your ticket purchase for {event.title}
            </p>
          </div>

          <section className="mt-12 grid gap-8 lg:grid-cols-12">
            <Card className="p-8 lg:col-span-7">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Attendee Information
              </h2>

              <form className="mt-7 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Full Name{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Email Address{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    required
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Phone Number{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 010-1234"
                    autoComplete="tel"
                    required
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="ticketType"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Ticket Type{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <select
                    id="ticketType"
                    name="ticketType"
                    required
                    defaultValue={selectedTicket?.name}
                    className={selectStyles}
                  >
                    {event.ticketTypes.map((ticket) => (
                      <option key={ticket.name} value={ticket.name}>
                        {ticket.name} — {formatCurrency(ticket.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">

                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Quantity{" "}
                    <span className="text-purple-600 dark:text-purple-400">*</span>
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    required
                    defaultValue="1"
                    className={selectStyles}
                  >
                    {Array.from({ length: 5 }, (_, index) => index + 1).map(
                      (value) => (
                        <option key={value} value={String(value)}>
                          {value} Ticket{value === 1 ? "" : "s"}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </form>
            </Card>

            <Card className="p-8 lg:col-span-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Order Summary
              </h2>

              <div className="mt-7 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">
                    {selectedTicket?.name ?? "Ticket"}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(selectedTicket?.price ?? 0)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">Quantity</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    × {quantity}
                  </p>
                </div>

                <div className="my-2 h-px w-full bg-purple-200/70 dark:bg-white/10" />

                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">Subtotal</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-300">Service Fee</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(serviceFee)}
                  </p>
                </div>

                <div className="my-2 h-px w-full bg-purple-200/70 dark:bg-white/10" />

                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    Total
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>

              <Link
                href={`/${organizer}/events/${event.id}/checkout/success`}
                className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 dark:focus-visible:ring-purple-400/30"
              >
                Proceed to Payment
              </Link>

              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                Your payment is secure and encrypted
              </p>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Page;
