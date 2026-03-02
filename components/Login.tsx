"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface Props {
  role: "Admin" | "Organizer";
  redirectTo: string;
}

function Login(props: Props) {
  const { role, redirectTo } = props;
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(redirectTo);
  };

  const inputStyles =
    "h-12 w-full rounded-lg border border-purple-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

  return (
    <div className=" w-full pt-20 px-4 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <header className="mb-8 text-center flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            {role} Login
          </h1>
          <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
            Sign in to manage your events
          </p>
        </header>

        <div className="w-full rounded-2xl border border-purple-200/70 bg-white p-8 shadow-md md:p-8 dark:border-white/10 dark:bg-white/5">
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
                defaultValue="demo@example.com"
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
                  defaultValue="demo123"
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

            <button
              type="submit"
              className="mt-2 h-12 w-full rounded-lg bg-purple-600 font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600/30 hover:dark:bg-purple-500 dark:focus-visible:ring-purple-400/30 hover:dark:ring-purple-400/40 hover:cursor-pointer"
            >
              Sign In
            </button>

            <div className="pt-2">
              <div className="my-4 h-px w-full bg-purple-200/70 dark:bg-white/10" />
              <p className="text-center text-xs text-slate-600 dark:text-slate-300">
                Demo credentials (any email/password)
              </p>
              <div className="mt-4 rounded-lg border border-purple-200/70 bg-purple-50 p-4 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    <span className="text-slate-900 dark:text-white">
                      Email:
                    </span>
                    demo@example.com
                  </li>
                  <li>
                    <span className="text-slate-900 dark:text-white">
                      Password:
                    </span>
                    demo123
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
