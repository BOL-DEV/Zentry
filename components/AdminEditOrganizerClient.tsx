"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowLeft, LuBuilding2 } from "react-icons/lu";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import {
  getAdminOrganizerDetail,
  getAdminProfile,
  updateAdminOrganizer,
} from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const textAreaStyles =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

type Props = {
  organizerId: string;
};

function AdminEditOrganizerClient({ organizerId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user } = useAdminAuthSession();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
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
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const organizerQuery = useQuery({
    queryKey: ["admin-organizer", organizerId],
    queryFn: () => getAdminOrganizerDetail(organizerId),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace(
        `/admin/login?next=${encodeURIComponent(`/dashboard/admin/organizers/${organizerId}/edit`)}&reason=auth-required`,
      );
    }
  }, [organizerId, router, token]);

  useEffect(() => {
    if (!profileQuery.data?.admin) return;
    setAdminAuthUser(profileQuery.data.admin);
  }, [profileQuery.data]);

  useEffect(() => {
    if (profileQuery.isFetching) return;
    if (!isAuthIssue(profileQuery.error)) return;
    clearAdminAuthToken();
    router.replace(
      `/admin/login?next=${encodeURIComponent(`/dashboard/admin/organizers/${organizerId}/edit`)}&reason=session-expired`,
    );
  }, [organizerId, profileQuery.error, profileQuery.isFetching, router]);

  useEffect(() => {
    if (!organizerQuery.data?.organizer) return;

    const organizer = organizerQuery.data.organizer;
    setForm({
      name: organizer.name || "",
      logoUrl: organizer.logoUrl || "",
      bannerUrl: organizer.bannerUrl || "",
      heroTitle: organizer.heroTitle || "",
      heroSubtitle: organizer.heroSubtitle || "",
      about: organizer.about || "",
      contactEmail: organizer.contactEmail || "",
      contactPhone: organizer.contactPhone || "",
      location: organizer.location || "",
      bankName: organizer.bankDetails?.bankName || "",
      bankCode: organizer.bankDetails?.bankCode || "",
      accountNumber: organizer.bankDetails?.accountNumber || "",
      accountName: organizer.bankDetails?.accountName || "",
    });
  }, [organizerQuery.data]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const organizer = await updateAdminOrganizer(organizerId, {
        name: form.name,
        logoUrl: form.logoUrl,
        bannerUrl: form.bannerUrl,
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        about: form.about,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        location: form.location,
        logoFile,
        bannerFile,
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
            : {},
      });

      void queryClient.invalidateQueries({ queryKey: ["admin-organizer", organizerId] });
      void queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      setSuccess(`Saved updates for ${organizer.name}.`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to update organizer right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching || organizerQuery.isLoading) {
    return <FullPageLoader title="Loading organizer editor" description="Preparing organizer data and update controls." />;
  }

  if (profileQuery.error || organizerQuery.error || !profileQuery.data?.admin || !organizerQuery.data) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : organizerQuery.error instanceof Error
          ? organizerQuery.error.message
          : "We couldn't open the organizer editor right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto max-w-5xl px-6 pt-10 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <section className="border-b border-purple-200/70 bg-white/80 pt-10 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href={`/dashboard/admin/organizers/${organizerId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
          >
            <LuArrowLeft className="text-base" />
            Back to organizer
          </Link>
          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
              Edit Organizer
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              Update organizer profile and payout details.
            </h1>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                <LuBuilding2 className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Organizer Update
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
                    Logo Upload
                  </label>
                  <input
                    className={inputStyles}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Banner Upload
                  </label>
                  <input
                    className={inputStyles}
                    type="file"
                    accept="image/*"
                    onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)}
                  />
                </div>
                {[
                  ["Organizer Name", "name"],
                  ["Location", "location"],
                  ["Contact Email", "contactEmail"],
                  ["Contact Phone", "contactPhone"],
                  ["Logo URL Fallback", "logoUrl"],
                  ["Banner URL Fallback", "bannerUrl"],
                  ["Hero Title", "heroTitle"],
                  ["Hero Subtitle", "heroSubtitle"],
                  ["Bank Name", "bankName"],
                  ["Bank Code", "bankCode"],
                  ["Account Number", "accountNumber"],
                  ["Account Name", "accountName"],
                ].map(([label, key]) => (
                  <div key={key} className={`space-y-2 ${["heroTitle", "heroSubtitle"].includes(key) ? "md:col-span-2" : ""}`}>
                    <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {label}
                    </label>
                    <input
                      className={inputStyles}
                      type={key === "contactEmail" ? "email" : "text"}
                      value={form[key as keyof typeof form]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
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
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving changes..." : "Save Organizer Changes"}
              </button>
            </form>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default AdminEditOrganizerClient;
