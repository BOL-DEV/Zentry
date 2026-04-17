"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowLeft, LuArrowUpRight, LuBuilding2 } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { createAdminOrganizer, getAdminProfile } from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const textAreaStyles =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

function AdminCreateOrganizerClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user } = useAdminAuthSession();
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    bannerUrl: "",
    heroTitle: "",
    heroSubtitle: "",
    about: "",
    contactEmail: "",
    contactPhone: "",
    location: "",
    bankName: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | { name: string; slug: string }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login?next=/dashboard/admin/organizers/create&reason=auth-required");
    }
  }, [router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;
    clearAdminAuthToken();
    router.replace("/admin/login?next=/dashboard/admin/organizers/create&reason=session-expired");
  }, [profileQuery.error, profileQuery.isFetching, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const organizer = await createAdminOrganizer({
        name: form.name,
        logoUrl: form.logoUrl,
        bannerUrl: form.bannerUrl,
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        about: form.about,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        location: form.location,
        bankDetails:
          form.bankName.trim() ||
          form.bankCode.trim() ||
          form.accountNumber.trim() ||
          form.accountName.trim()
            ? {
                bankName: form.bankName.trim(),
                bankCode: form.bankCode.trim(),
                accountNumber: form.accountNumber.trim(),
                accountName: form.accountName.trim(),
              }
            : undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      setSuccess({ name: organizer.name, slug: organizer.slug });
      setForm({
        name: "",
        logoUrl: "",
        bannerUrl: "",
        heroTitle: "",
        heroSubtitle: "",
        about: "",
        contactEmail: "",
        contactPhone: "",
        location: "",
        bankName: "",
        bankCode: "",
        accountNumber: "",
        accountName: "",
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to create organizer right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching) {
    return <FullPageLoader title="Loading organizer setup" description="Preparing the admin organizer creation workspace." />;
  }

  if (profileQuery.error || !profileQuery.data?.admin) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : "We couldn't open the organizer creation page right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader role="admin" email={user?.email || "Platform workspace"} />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader
        role="admin"
        email={
          profileQuery.data.admin.email || user?.email || "Platform workspace"
        }
      />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/dashboard/admin/organizers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
          >
            <LuArrowLeft className="text-base" />
            Back to organizers
          </Link>
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
                Create Organizer
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Launch a new organizer profile.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                This form creates the organizer record first. The slug is
                generated from the organizer name by the backend.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                <LuBuilding2 className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Organizer Setup
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  Profile details
                </h2>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Organizer Name
                  </label>
                  <input
                    className={inputStyles}
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Location
                  </label>
                  <input
                    className={inputStyles}
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    className={inputStyles}
                    value={form.contactEmail}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contactEmail: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Contact Phone
                  </label>
                  <input
                    className={inputStyles}
                    value={form.contactPhone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        contactPhone: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Logo URL
                  </label>
                  <input
                    className={inputStyles}
                    value={form.logoUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        logoUrl: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Banner URL
                  </label>
                  <input
                    className={inputStyles}
                    value={form.bannerUrl}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bannerUrl: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Hero Title
                  </label>
                  <input
                    className={inputStyles}
                    value={form.heroTitle}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        heroTitle: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Hero Subtitle
                  </label>
                  <input
                    className={inputStyles}
                    value={form.heroSubtitle}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        heroSubtitle: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    About
                  </label>
                  <textarea
                    rows={6}
                    className={textAreaStyles}
                    value={form.about}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        about: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Bank Name
                  </label>
                  <input
                    className={inputStyles}
                    value={form.bankName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bankName: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Bank Code
                  </label>
                  <input
                    className={inputStyles}
                    value={form.bankCode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        bankCode: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Account Number
                  </label>
                  <input
                    className={inputStyles}
                    value={form.accountNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        accountNumber: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Account Name
                  </label>
                  <input
                    className={inputStyles}
                    value={form.accountName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        accountName: event.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Organizer created for <strong>{success.name}</strong> with
                  slug <strong>{success.slug}</strong>.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating organizer..." : "Create Organizer"}
              </button>
            </form>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              What happens next
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <p>
                The backend auto-generates the organizer slug from the name and now accepts bank details directly on admin organizer creation.
              </p>
              <p>
                If the slug already exists, the backend returns a `400`, so this
                page will surface that cleanly.
              </p>
              <p>
                After organizer creation, the natural next step is creating the
                first organizer or staff dashboard user for that organizer.
              </p>
            </div>

            <div className="mt-6">
              <Link
                href="/dashboard/admin/users/create"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
              >
                Go create a dashboard user
                <LuArrowUpRight className="text-base" />
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default AdminCreateOrganizerClient;
