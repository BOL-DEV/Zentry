"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { setAuthToken, setAuthUser } from "@/helpers/auth";
import { useAuthSession } from "@/helpers/auth-client";
import { loginDashboardUser } from "@/helpers/organizer-api";

interface Props {
  redirectTo?: string;
  notice?: string;
}

function Login(props: Props) {
  const { redirectTo, notice } = props;
  const router = useRouter();
  const { token, user } = useAuthSession();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const fallbackRoute =
      user.role === "staff"
        ? `/${user.organizerSlug}/staff`
        : `/${user.organizerSlug}/dashboard`;

    router.replace(redirectTo || fallbackRoute);
  }, [redirectTo, router, token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const resolvedDeviceName =
        (typeof window !== "undefined" ? window.navigator.platform : "") ||
        "This device";

      const response = await loginDashboardUser({
        email,
        password,
        deviceName: resolvedDeviceName,
      });
      setAuthToken(response.token, { persist: rememberMe });
      setAuthUser(response.data.user, { persist: rememberMe });

      const fallbackRoute =
        response.data.user.role === "staff"
          ? `/${response.data.user.organizerSlug}/staff`
          : `/${response.data.user.organizerSlug}/dashboard`;

      router.push(redirectTo || fallbackRoute);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyles =
    "h-12 w-full rounded-lg border border-purple-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  return (
    <div className=" w-full pt-20 px-4 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <header className="mb-8 text-center flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            Sign In
          </h1>
          <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
            Sign in to manage events or check guests in
          </p>
        </header>

        <div className="w-full rounded-2xl border border-purple-200/70 bg-white p-8 shadow-md md:p-8 dark:border-white/10 dark:bg-white/5">
          {notice ? (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
              {notice}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputStyles}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
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
              className="mt-2 h-12 w-full rounded-lg bg-purple-600 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 hover:dark:bg-purple-500 dark:focus-visible:ring-purple-400/30 hover:dark:ring-purple-400/40 hover:cursor-pointer"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>

            <div className="pt-2">
              <div className="my-4 h-px w-full bg-purple-200/70 dark:bg-white/10" />
              <p className="text-center text-xs text-slate-600 dark:text-slate-300">
                Use your Zentra account details
              </p>
              <div className="mt-4 rounded-lg border border-purple-200/70 bg-purple-50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    <span className="text-slate-900 dark:text-white">
                      Event managers:
                    </span>
                    go to the main event dashboard
                  </li>
                  <li>
                    <span className="text-slate-900 dark:text-white">
                      Check-in team:
                    </span>
                    go to the guest check-in area
                  </li>
                </ul>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
