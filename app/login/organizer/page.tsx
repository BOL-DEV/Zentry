import Login from "@/components/Login";
import Header from "@/components/Header";

// interface Props {}

function Page() {
  return (
    <div className="bg-purple-100 dark:bg-slate-950/90 min-h-screen flex items-center justify-center">
      <Header />
      <Login role="Organizer" redirectTo="/dashboard/organizer" />
    </div>
  );
}

export default Page;
