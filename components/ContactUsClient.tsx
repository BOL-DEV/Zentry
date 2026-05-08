"use client";

import { useCallback, useState } from "react";
import { IoCallOutline, IoMailOutline, IoTimeOutline } from "react-icons/io5";

import Card from "@/components/Card";

type ContactFeedback = {
  type: "success" | "error";
  message: string;
};

type ContactDetail = {
  title: string;
  body: string;
  note: string;
  icon: React.ReactNode;
};

const inputStyles =
  "h-12 w-full rounded-lg border border-purple-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const textareaStyles =
  "min-h-36 w-full resize-none rounded-lg border border-purple-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const contactDetails: ContactDetail[] = [
  {
    title: "Email",
    body: "support@zentra.com",
    note: "Best for product questions and account help.",
    icon: <IoMailOutline size={20} />,
  },
  {
    title: "Phone",
    body: "+1 (555) 010-2040",
    note: "For urgent event-day operational support.",
    icon: <IoCallOutline size={20} />,
  },
  {
    title: "Response time",
    body: "Typically within 24-48 hours",
    note: "Priority support is available on the Pro plan.",
    icon: <IoTimeOutline size={20} />,
  },
];

function ContactInfoCard({ detail }: { detail: ContactDetail }) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 dark:bg-white/5 dark:text-purple-300">
          {detail.icon}
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {detail.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{detail.body}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{detail.note}</p>
        </div>
      </div>
    </Card>
  );
}

function ContactUsClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<ContactFeedback | null>(null);

  const onSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; data?: { message?: string } }
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            payload?.data?.message ||
            "We could not send your message right now.",
        );
      }

      form.reset();
      setFeedback({
        type: "success",
        message:
          payload?.data?.message || "Your message has been sent successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not send your message right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <section className="mx-auto px-6 pb-12 pt-32 lg:max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Questions about Zentra, pricing, or onboarding? Send us a message and
            we&apos;ll get back to you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="grid gap-6">
              {contactDetails.map((detail) => (
                <ContactInfoCard key={detail.title} detail={detail} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Send a message
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Tell us what you&apos;re building and how we can help.
              </p>

              <form className="mt-6 space-y-5" onSubmit={onSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Jane Doe"
                      required
                      className={inputStyles}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      autoComplete="email"
                      required
                      className={inputStyles}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Pricing, onboarding, payouts, and more"
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Share a few details so we can point you in the right direction."
                    required
                    className={textareaStyles}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 h-12 w-full rounded-lg bg-purple-600 font-semibold text-white transition hover:cursor-pointer hover:bg-purple-700 hover:dark:bg-purple-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 dark:focus-visible:ring-purple-400/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                </button>

                {feedback ? (
                  <p
                    className={`text-sm ${
                      feedback.type === "success"
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-rose-600 dark:text-rose-300"
                    }`}
                  >
                    {feedback.message}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your message will be sent directly to the Zentra support inbox.
                  </p>
                )}
              </form>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ContactUsClient;
