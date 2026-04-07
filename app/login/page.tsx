import Header from "@/components/Header";
import Login from "@/components/Login";

type Props = {
  searchParams?: Promise<{ next?: string; reason?: string }>;
};

async function Page({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const notice =
    params.reason === "session-expired"
      ? "Session has been logged out. Please sign in again."
      : params.reason === "auth-required"
        ? "Please sign in to continue."
        : undefined;

  return (
    <div className="bg-purple-100 dark:bg-slate-950/90 min-h-screen flex items-center justify-center">
      <Header />
      <Login redirectTo={params.next} notice={notice} />
    </div>
  );
}

export default Page;
