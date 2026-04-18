"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Card from "@/components/Card";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import {
  changeDashboardPassword,
  getOrganizerProfileForEdit,
  updateOrganizerProfile,
} from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

const textAreaStyles =
  "min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

type Props = {
  organizer: string;
};

function OrganizerEditProfileClient({ organizer }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const [passwordMessage, setPasswordMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const [sessionLimits, setSessionLimits] = useState({
    organizerSessionLimit: 0,
    staffSessionLimit: 0,
  });
  const [form, setForm] = useState({
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
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let active = true;

    async function loadOrganizer() {
      try {
        const data = await getOrganizerProfileForEdit(organizer);
        if (!active) return;

        setForm({
          logoUrl: data.organizer.logoUrl || "",
          bannerUrl: data.organizer.bannerUrl || "",
          heroTitle: data.organizer.heroTitle || "",
          heroSubtitle: data.organizer.heroSubtitle || "",
          about: data.organizer.about || "",
          contactEmail: data.organizer.contactEmail || "",
          contactPhone: data.organizer.contactPhone || "",
          location: data.organizer.location || "",
          bankName: data.organizer.bankDetails?.bankName || "",
          bankCode: data.organizer.bankDetails?.bankCode || "",
          accountNumber: data.organizer.bankDetails?.accountNumber || "",
          accountName: data.organizer.bankDetails?.accountName || "",
        });
        setSessionLimits({
          organizerSessionLimit: data.organizer.organizerSessionLimit ?? 0,
          staffSessionLimit: data.organizer.staffSessionLimit ?? 0,
        });
      } catch (error) {
        if (!active) return;
        setMessage({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "We couldn't load the organizer profile right now.",
        });
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadOrganizer();

    return () => {
      active = false;
    };
  }, [organizer]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateOrganizerProfile({
        logoUrl: form.logoUrl.trim(),
        bannerUrl: form.bannerUrl.trim(),
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle.trim(),
        about: form.about.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        location: form.location.trim(),
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
      }),
    onSuccess: () => {
      setMessage({
        type: "success",
        text: "Organizer profile updated successfully.",
      });
      router.push(`/${organizer}/dashboard`);
      router.refresh();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't update the organizer profile.",
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      changeDashboardPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    onSuccess: () => {
      setPasswordMessage({
        type: "success",
        text: "Password updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      setPasswordMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't update your password right now.",
      });
    },
  });

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
        <WorkspaceTopbar
          eyebrow="Organizer Workspace"
          title="Edit Profile"
          description="Update the public organizer profile and payout account details from one place."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
        />

        <Card className="mt-8">
          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Loading organizer profile...
            </p>
          ) : (
            <form
              className="space-y-8"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage(null);
                updateMutation.mutate();
              }}
            >
              <section className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Public Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Keep your organizer branding and contact details current.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    ["Logo URL", "logoUrl"],
                    ["Banner URL", "bannerUrl"],
                    ["Hero Title", "heroTitle"],
                    ["Hero Subtitle", "heroSubtitle"],
                    ["Contact Email", "contactEmail"],
                    ["Contact Phone", "contactPhone"],
                    ["Location", "location"],
                  ].map(([label, key]) => (
                    <div
                      key={key}
                      className={`space-y-2 ${
                        ["heroTitle", "heroSubtitle"].includes(key)
                          ? "md:col-span-2"
                          : ""
                      }`}
                    >
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white">
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
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                      About
                    </label>
                    <textarea
                      className={textAreaStyles}
                      rows={6}
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
              </section>

              <section className="space-y-6 border-t border-slate-200 pt-8 dark:border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Payout Bank Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Fill these to replace payout details. Leave empty if you do not want to update them right now.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    ["Bank Name", "bankName"],
                    ["Bank Code", "bankCode"],
                    ["Account Number", "accountNumber"],
                    ["Account Name", "accountName"],
                  ].map(([label, key]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {label}
                      </label>
                      <input
                        className={inputStyles}
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
                </div>
              </section>

              <section className="space-y-6 border-t border-slate-200 pt-8 dark:border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Session Limits
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    The backend now controls how many active organizer and staff devices can stay signed in at once.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Organizer Sessions
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {sessionLimits.organizerSessionLimit || "Not set"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Your workspace now follows the organizer session limit returned by the backend.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Staff Sessions
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                      {sessionLimits.staffSessionLimit || "Not set"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Staff device limits also come from your organizer settings on the backend.
                    </p>
                  </div>
                </div>
              </section>

              {message ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                  }`}
                >
                  {message.text}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={updateMutation.isPending || isLoading}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updateMutation.isPending ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </form>
          )}
        </Card>

        <Card className="mt-8">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              setPasswordMessage(null);

              if (passwordForm.newPassword.length < 8) {
                setPasswordMessage({
                  type: "error",
                  text: "New password must be at least 8 characters long.",
                });
                return;
              }

              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordMessage({
                  type: "error",
                  text: "New password and confirmation must match.",
                });
                return;
              }

              passwordMutation.mutate();
            }}
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Change Password
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Update the organizer dashboard password from the new auth endpoint without leaving your profile workspace.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Current Password
                </label>
                <input
                  type="password"
                  className={inputStyles}
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  New Password
                </label>
                <input
                  type="password"
                  className={inputStyles}
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className={inputStyles}
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            {passwordMessage ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  passwordMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                }`}
              >
                {passwordMessage.text}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {passwordMutation.isPending ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default OrganizerEditProfileClient;
