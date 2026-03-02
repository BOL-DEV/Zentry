import Link from "next/link";
import MobileMenuToggle from "./MobileMenuToggle";
import ThemeToggle from "./ThemeToggle";

type DashboardRole = "admin" | "organizer";

interface Props {
  role: DashboardRole;
  email: string;
}

function DashboardHeader({ role, email}: Props) {

  return (
    <header className="border-b border-purple-200/70 bg-purple-100/90 text-slate-900 backdrop-blur dark:border-white/10 dark:bg-slate-950/95 dark:text-white fixed top-0 w-full z-50">
      <div className="mx-auto flex lg:max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-semibold"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-2xl">
            ⚡
          </span>
          <span className="text-purple-600 text-xl font-bold">EventFlow</span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center">
            <ul className="hidden list-none items-center gap-8 pr-6 text-xs font-medium uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300 lg:flex">
              <li>
                <Link
                  href="/"
                  className="font-semibold transition hover:text-purple-700 dark:hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="font-semibold transition hover:text-purple-700 dark:hover:text-white"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href={`/dashboard/${role}`}
                  className="font-semibold transition hover:text-purple-700 dark:hover:text-white"
                >
                  {role}
                </Link>
              </li>
            </ul>

            <div className="hidden lg:flex items-center gap-4 pr-4 border-l border-purple-200/70 dark:border-white/10 pl-4">
              <span className="text-sm text-slate-600 dark:text-slate-300 max-w-55 truncate">
                {email}
              </span>

              <Link
                href="/"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700"
              >
                Logout
              </Link>
            </div>

            <ThemeToggle />
            <MobileMenuToggle menuData={[]} />
          </nav>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
