"use client";

import Card from "@/components/Card";
import { useCallback } from "react";
import { IoCallOutline, IoMailOutline, IoTimeOutline } from "react-icons/io5";

function Page() {
    const inputStyles =
        "h-12 w-full rounded-lg border border-purple-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

    const textareaStyles =
        "min-h-36 w-full resize-none rounded-lg border border-purple-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

    const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const name = String(formData.get("name") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const subject = String(formData.get("subject") ?? "").trim();
        const message = String(formData.get("message") ?? "").trim();

        const to = "support@eventflow.com";
        const computedSubject = subject || "EventFlow — Contact";
        const body = [`Name: ${name}`, `Email: ${email}`, "", message]
            .filter(Boolean)
            .join("\n");

        const mailto = `mailto:${to}?subject=${encodeURIComponent(
            computedSubject
        )}&body=${encodeURIComponent(body)}`;

        window.location.assign(mailto);
    }, []);

    return (
        <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
            <section className="mx-auto lg:max-w-7xl px-6 pt-32 pb-12">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white">
                        Contact Us
                    </h1>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                        Questions about EventFlow, pricing, or onboarding? Send us a message
                        and we’ll get back to you.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <div className="grid gap-6">
                            <Card>
                                <div className="flex items-start gap-4">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 dark:bg-white/5 dark:text-purple-300">
                                        <IoMailOutline size={20} />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                            Email
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            support@eventflow.com
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            Best for product questions and account help.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start gap-4">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 dark:bg-white/5 dark:text-purple-300">
                                        <IoCallOutline size={20} />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                            Phone
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            +1 (555) 010-2040
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            For urgent event-day operational support.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start gap-4">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 dark:bg-white/5 dark:text-purple-300">
                                        <IoTimeOutline size={20} />
                                    </span>
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                                            Response time
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            Typically within 24–48 hours
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            Priority support is available on the Pro plan.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <Card className="p-8">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Send a message
                            </h2>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Tell us what you’re building and how we can help.
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
                                    className="mt-2 h-12 w-full rounded-lg bg-purple-600 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 hover:dark:bg-purple-500 dark:focus-visible:ring-purple-400/30 hover:cursor-pointer"
                                >
                                    Send message
                                </button>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    This opens your email client to send the message.
                                </p>
                            </form>
                        </Card>
                    </div>
                </div>
            </section>

        </main>
    );
}

export default Page;
