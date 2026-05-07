"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import Card from "@/components/Card";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { changeDashboardPassword } from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

function OrganizerChangePasswordClient({ organizer }: { organizer: string }) {
  const [message, setMessage] = useState<
    | { type: "success"; text: string }
    | { type: "error"; text: string }
    | null
  >(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordMutation = useMutation({
    mutationFn: () =>
      changeDashboardPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    onSuccess: () => {
      setMessage({
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
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "We couldn't update your password right now.",
      });
    },
  });

  return (
    <main className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <WorkspaceTopbar
          eyebrow="Profile Security"
          title="Change Password"
          description="Keep organizer access separate from profile edits and update your dashboard password here."
          backHref={`/${organizer}/dashboard/profile`}
          backLabel="Back to Profile"
          showLogoutButton={false}
          showActions={false}
        />

        <Card className="mt-8">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage(null);

              if (passwordForm.newPassword.length < 8) {
                setMessage({
                  type: "error",
                  text: "New password must be at least 8 characters long.",
                });
                return;
              }

              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setMessage({
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
                Dashboard Password
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Use your current organizer password, then set the new one you want for this dashboard account.
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

export default OrganizerChangePasswordClient;
