"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  LuArrowUpRight,
  LuBadgeCheck,
  LuBuilding2,
  LuImage,
  LuLandmark,
  LuSend,
  LuSparkles,
} from "react-icons/lu";

import { submitOrganizerRequest } from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-cyan-400/10 dark:bg-[#081427] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-300 dark:focus:ring-cyan-400/15";

const textAreaStyles =
  "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-cyan-400/10 dark:bg-[#081427] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-300 dark:focus:ring-cyan-400/15";

const defaultForm = {
  name: "",
  email: "",
  phone: "",
  about: "",
  location: "",
  preferredSlug: "",
  logoUrl: "",
  bannerUrl: "",
  heroTitle: "",
  heroSubtitle: "",
  bankName: "",
  bankCode: "",
  accountNumber: "",
  accountName: "",
};

function SectionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-cyan-400/12 dark:text-cyan-300">
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

function OrganizerRequestFormClient() {
  const [form, setForm] = useState(defaultForm);

  const requestMutation = useMutation({
    mutationFn: () =>
      submitOrganizerRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        about: form.about.trim() || undefined,
        location: form.location.trim() || undefined,
        preferredSlug: form.preferredSlug.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
        bannerUrl: form.bannerUrl.trim() || undefined,
        heroTitle: form.heroTitle.trim() || undefined,
        heroSubtitle: form.heroSubtitle.trim() || undefined,
        bankDetails:
          form.bankName.trim() ||
          form.bankCode.trim() ||
          form.accountNumber.trim() ||
          form.accountName.trim()
            ? {
                bankName: form.bankName.trim() || undefined,
                bankCode: form.bankCode.trim() || undefined,
                accountNumber: form.accountNumber.trim() || undefined,
                accountName: form.accountName.trim() || undefined,
              }
            : undefined,
      }),
    onSuccess: () => {
      setForm(defaultForm);
    },
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f3e8ff_0%,#efe4ff_36%,#f8f7ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#06101f_38%,#030712_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.16),transparent_34%),radial-gradient(circle_at_right,rgba(34,211,238,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_left,rgba(168,85,247,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,transparent,transparent)] dark:bg-[linear-gradient(180deg,rgba(34,211,238,0.08),transparent)]" />

      <section className="relative mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="self-start">
            <p className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-purple-300">
              <LuSparkles className="text-sm" />
              Organizer Onboarding
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Launch your branded organizer space with a request flow that fits EventFlow.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Submit your team details, branding assets, and payout information in one pass. Once approved, the platform creates your real organizer workspace and dashboard account.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:border dark:border-cyan-400/10 dark:bg-[#081427]/85 dark:text-white">
                <LuBadgeCheck className="text-purple-600 dark:text-purple-300" />
                Admin-reviewed onboarding
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:border dark:border-cyan-400/10 dark:bg-[#081427]/85 dark:text-white">
                <LuBuilding2 className="text-cyan-600 dark:text-cyan-300" />
                White-label organizer setup
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <SectionCard
                icon={<LuBuilding2 className="text-lg" />}
                title="Core request"
                description="Share your organizer name, contact details, location, and preferred slug so the review team can place you correctly."
              />
              <SectionCard
                icon={<LuImage className="text-lg" />}
                title="Branding ready"
                description="Provide logo, banner, hero title, and hero subtitle so approval can translate directly into a polished public profile."
              />
              <SectionCard
                icon={<LuLandmark className="text-lg" />}
                title="Payout aware"
                description="Include bank details if you want finance-ready onboarding from the start instead of following up later."
              />
              <SectionCard
                icon={<LuBadgeCheck className="text-lg" />}
                title="Approval path"
                description="Admins approve or reject requests first, and only approved submissions become real organizers and dashboard accounts."
              />
            </div>

            <div className="mt-10 rounded-[30px] border border-slate-200 bg-white/75 p-6 shadow-sm dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(8,20,39,0.9),rgba(4,11,23,0.95))] dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Already onboarded?
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:border dark:border-cyan-400/20 dark:bg-cyan-400/12 dark:text-cyan-100 dark:hover:bg-cyan-400/18"
                >
                  Organizer Login
                  <LuArrowUpRight className="text-base" />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-purple-200/70 bg-white/88 p-6 shadow-[0_24px_70px_rgba(88,28,135,0.12)] backdrop-blur dark:border-cyan-400/10 dark:bg-[linear-gradient(180deg,rgba(7,18,35,0.97),rgba(3,10,22,0.99))] dark:shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Submit Request
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
              Organizer application
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This page now follows the updated backend contract, so the application can capture organizer setup details in one clean review flow.
            </p>

            <form
              className="mt-8 space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                requestMutation.mutate();
              }}
            >
              <section className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/18 dark:text-purple-200">
                    <LuBuilding2 className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Core Details
                    </h3>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Organizer Name
                    </span>
                    <input
                      className={inputStyles}
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Email
                    </span>
                    <input
                      type="email"
                      className={inputStyles}
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, email: event.target.value }))
                      }
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Phone
                    </span>
                    <input
                      className={inputStyles}
                      value={form.phone}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Location
                    </span>
                    <input
                      className={inputStyles}
                      value={form.location}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, location: event.target.value }))
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Preferred Slug
                    </span>
                    <input
                      className={inputStyles}
                      value={form.preferredSlug}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          preferredSlug: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      About
                    </span>
                    <textarea
                      rows={6}
                      className={textAreaStyles}
                      value={form.about}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, about: event.target.value }))
                      }
                      placeholder="Tell the team what kind of experiences you organize."
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-5 border-t border-slate-200/80 pt-6 dark:border-cyan-400/10">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-400/14 dark:text-cyan-200">
                    <LuImage className="text-lg" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Branding
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Logo URL
                    </span>
                    <input
                      className={inputStyles}
                      value={form.logoUrl}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, logoUrl: event.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Banner URL
                    </span>
                    <input
                      className={inputStyles}
                      value={form.bannerUrl}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, bannerUrl: event.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Hero Title
                    </span>
                    <input
                      className={inputStyles}
                      value={form.heroTitle}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, heroTitle: event.target.value }))
                      }
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Hero Subtitle
                    </span>
                    <textarea
                      rows={4}
                      className={textAreaStyles}
                      value={form.heroSubtitle}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          heroSubtitle: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-5 border-t border-slate-200/80 pt-6 dark:border-cyan-400/10">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/14 dark:text-emerald-200">
                    <LuLandmark className="text-lg" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Bank Details
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Bank Name
                    </span>
                    <input
                      className={inputStyles}
                      value={form.bankName}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, bankName: event.target.value }))
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Bank Code
                    </span>
                    <input
                      className={inputStyles}
                      value={form.bankCode}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, bankCode: event.target.value }))
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Account Number
                    </span>
                    <input
                      className={inputStyles}
                      value={form.accountNumber}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          accountNumber: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      Account Name
                    </span>
                    <input
                      className={inputStyles}
                      value={form.accountName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          accountName: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </section>

              {requestMutation.isSuccess && requestMutation.data ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                  Request submitted for <strong>{requestMutation.data.name}</strong>. Status is currently{" "}
                  <strong>{requestMutation.data.status}</strong>.
                </div>
              ) : null}

              {requestMutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                  {requestMutation.error instanceof Error
                    ? requestMutation.error.message
                    : "We couldn't submit your organizer request right now."}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={requestMutation.isPending}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-70 dark:border dark:border-cyan-400/20 dark:bg-cyan-400/14 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
                >
                  <LuSend className="text-base" />
                  {requestMutation.isPending ? "Submitting..." : "Submit Organizer Request"}
                </button>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your submission stays as a request until an admin reviews it.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OrganizerRequestFormClient;
