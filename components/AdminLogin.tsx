"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FiEye, FiEyeOff } from "react-icons/fi";

import {
  clearAdminAuthToken,
  setAdminAuthToken,
  setAdminAuthUser,
} from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { resolveUrl } from "@/helpers/api";
import { isJwtExpired } from "@/helpers/jwt";
import { loginAdminUser } from "@/helpers/organizer-api";

interface Props {
  redirectTo?: string;
  notice?: string;
}

function AdminLogin({ redirectTo, notice }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAdminAuthSession();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    if (isJwtExpired(token)) {
      clearAdminAuthToken();
      return;
    }

    let cancelled = false;

    async function validateThenRedirect() {
      try {
        const response = await fetch(resolveUrl("/admin/auth/me"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (cancelled) return;

        if (response.status === 401) {
          clearAdminAuthToken();
          return;
        }

        router.replace(redirectTo || "/dashboard/admin");
      } catch {
        if (cancelled) return;
        router.replace(redirectTo || "/dashboard/admin");
      }
    }

    void validateThenRedirect();

    return () => {
      cancelled = true;
    };
  }, [redirectTo, router, token]);

  const inputStyles =
    "h-12 w-full rounded-lg border border-purple-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const resolvedDeviceName =
        (typeof window !== "undefined" ? window.navigator.platform : "") ||
        "This device";

      const response = await loginAdminUser({
        email,
        password,
        deviceName: resolvedDeviceName,
        rememberMe,
      });

      queryClient.removeQueries({ queryKey: ["admin-profile"] });
      queryClient.removeQueries({ queryKey: ["admin-analytics"] });
      queryClient.removeQueries({ queryKey: ["admin-organizers"] });
      queryClient.removeQueries({ queryKey: ["admin-orders"] });
      setAdminAuthToken(response.token, { persist: rememberMe });
      setAdminAuthUser(response.data.admin, { persist: rememberMe });
      router.replace(redirectTo || "/dashboard/admin");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full px-4 py-16 pt-20">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <header className="mb-8 flex flex-col gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">
            Admin Access
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            Sign In to Admin
          </h1>
          <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
            Access the platform workspace for organizers, events, and admin operations.
          </p>
        </header>

        <div className="w-full rounded-2xl border border-purple-200/70 bg-white p-8 shadow-md dark:border-white/10 dark:bg-white/5">
          {notice ? (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
              {notice}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputStyles}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-2 inline-flex items-center justify-center rounded-md px-2 text-slate-500 transition hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/20 dark:text-slate-300 dark:hover:text-white dark:focus-visible:ring-purple-400/20"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-purple-200 text-purple-600 focus:ring-purple-600/30 dark:border-white/20 dark:bg-slate-900"
              />
              Remember me
            </label>

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full rounded-lg bg-purple-600 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 dark:focus-visible:ring-purple-400/30"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
