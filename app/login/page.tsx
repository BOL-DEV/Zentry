import Header from "@/components/Header";
import Login from "@/components/Login";

type Props = {
  searchParams?: Promise<{ next?: string }>;
};

async function Page({ searchParams }: Props) {
  const params = (await searchParams) ?? {};

  return (
    <div className="bg-purple-100 dark:bg-slate-950/90 min-h-screen flex items-center justify-center">
      <Header />
      <Login redirectTo={params.next} />
    </div>
  );
}

export default Page;
