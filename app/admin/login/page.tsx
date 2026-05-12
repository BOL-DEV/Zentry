import AdminLogin from "@/components/AdminLogin";

type Props = {
  searchParams?: Promise<{ next?: string; reason?: string }>;
};

async function AdminLoginPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice =
    params.reason === "session-expired"
      ? "Admin session expired. Please sign in again."
      : params.reason === "auth-required"
        ? "Please sign in to continue to the admin dashboard."
        : undefined;

  return (
    <div className="min-h-screen bg-purple-100 dark:bg-slate-950/90 flex items-center justify-center">
      <AdminLogin redirectTo={params.next} notice={notice} />
    </div>
  );
}

export default AdminLoginPage;
