"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LuArrowLeft, LuArrowUpRight, LuUserPlus } from "react-icons/lu";

import Card from "@/components/Card";
import DashboardHeader from "@/components/DashboardHeader";
import FullPageLoader from "@/components/FullPageLoader";
import { clearAdminAuthToken, setAdminAuthUser } from "@/helpers/admin-auth";
import { useAdminAuthSession } from "@/helpers/admin-auth-client";
import { isAuthIssue } from "@/helpers/auth-redirect";
import {
  createAdminDashboardUser,
  getAdminOrganizers,
  getAdminProfile,
} from "@/helpers/organizer-api";

const inputStyles =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-600/15 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/20";

function AdminCreateUserClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, user } = useAdminAuthSession();
  const [form, setForm] = useState({
    organizerId: "",
    fullName: "",
    email: "",
    password: "",
    role: "organizer" as "organizer" | "staff",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | { fullName: string; role: string }>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["admin-profile"],
    queryFn: getAdminProfile,
    enabled: Boolean(token),
    retry: false,
  });

  const organizersQuery = useQuery({
    queryKey: ["admin-organizers", "picker"],
    queryFn: () => getAdminOrganizers({ page: 1, limit: 100 }),
    enabled: Boolean(token) && Boolean(profileQuery.data?.admin),
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login?next=/dashboard/admin/users/create&reason=auth-required");
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
    router.replace("/admin/login?next=/dashboard/admin/users/create&reason=session-expired");
  }, [profileQuery.error, profileQuery.isFetching, router]);

  useEffect(() => {
    if (!form.organizerId && organizersQuery.data?.organizers?.length) {
      setForm((current) => ({
        ...current,
        organizerId: current.organizerId || organizersQuery.data.organizers[0].id,
      }));
    }
  }, [form.organizerId, organizersQuery.data]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const createdUser = await createAdminDashboardUser(form);
      queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      setSuccess({ fullName: createdUser.fullName, role: createdUser.role });
      setForm((current) => ({
        ...current,
        fullName: "",
        email: "",
        password: "",
        role: "organizer",
      }));
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to create user right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return <FullPageLoader title="Redirecting to admin login" description="Taking you to the secure admin sign-in page." />;
  }

  if (profileQuery.isLoading || profileQuery.isFetching || organizersQuery.isLoading) {
    return <FullPageLoader title="Loading user setup" description="Preparing organizers and admin controls for user creation." />;
  }

  if (profileQuery.error || organizersQuery.error || !profileQuery.data?.admin) {
    const message =
      profileQuery.error instanceof Error
        ? profileQuery.error.message
        : organizersQuery.error instanceof Error
          ? organizersQuery.error.message
          : "We couldn't open the user creation page right now.";

    return (
      <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
        <DashboardHeader role="admin" email={user?.email || "Platform workspace"} />
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-16">
          <Card className="text-sm text-rose-700 dark:text-rose-300">{message}</Card>
        </div>
      </main>
    );
  }

  const organizers = organizersQuery.data?.organizers ?? [];

  return (
    <main className="min-h-screen bg-purple-100 dark:bg-slate-950/90">
      <DashboardHeader role="admin" email={profileQuery.data.admin.email || user?.email || "Platform workspace"} />

      <section className="border-b border-purple-200/70 bg-white/80 pt-28 pb-12 dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200">
            <LuArrowLeft className="text-base" />
            Back to admin dashboard
          </Link>
          <div className="mt-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-700 dark:text-purple-300">Create Dashboard User</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl dark:text-white">Add an organizer or staff account.</h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">This uses the admin-only user creation endpoint and binds the account to an existing organizer.</p>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
                <LuUserPlus className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Account Setup</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">User details</h2>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Organizer</label>
                  <select className={inputStyles} value={form.organizerId} onChange={(event) => setForm((current) => ({ ...current, organizerId: event.target.value }))} required>
                    {organizers.map((organizer) => (
                      <option key={organizer.id} value={organizer.id}>
                        {organizer.name} (@{organizer.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Full Name</label>
                  <input className={inputStyles} value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Role</label>
                  <select className={inputStyles} value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as "organizer" | "staff" }))} required>
                    <option value="organizer">Organizer</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Email</label>
                  <input type="email" className={inputStyles} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Password</label>
                  <input type="password" className={inputStyles} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
                </div>
              </div>

              {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{error}</div> : null}
              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <strong>{success.fullName}</strong> has been created as a <strong>{success.role}</strong> user.
                </div>
              ) : null}

              <button type="submit" disabled={isSubmitting || organizers.length === 0} className="inline-flex h-12 items-center justify-center rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? "Creating user..." : "Create User"}
              </button>
            </form>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Flow notes</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <p>The backend enforces unique email across all dashboard users.</p>
              <p>The new user is active by default and immediately belongs to the selected organizer.</p>
              <p>If you need an organizer first, create it before using this page.</p>
            </div>

            <div className="mt-6">
              <Link href="/dashboard/admin/organizers/create" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200">
                Create an organizer first
                <LuArrowUpRight className="text-base" />
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

export default AdminCreateUserClient;
