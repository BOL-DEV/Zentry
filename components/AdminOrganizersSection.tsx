import Link from "next/link";
import { LuUsers } from "react-icons/lu";
import { adminDemoOrganizers } from "@/data/demo";

export type OrganizerRow = {
  id: string;
  name: string;
  email: string;
  eventsCount: number;
  status: "Active" | "Inactive";
  manageHref?: string;
};

const demoOrganizers: OrganizerRow[] = adminDemoOrganizers as unknown as OrganizerRow[];

type Props = {
  organizers?: OrganizerRow[];
};

function StatusPill({ status }: { status: OrganizerRow["status"] }) {
  const isActive = status === "Active";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold " +
        (isActive
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300")
      }
    >
      {status}
    </span>
  );
}

function AdminOrganizersSection({ organizers = demoOrganizers }: Props) {
  return (
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto lg:max-w-7xl px-6 pb-14">
        <div className="flex items-center gap-3">
          <LuUsers className="text-xl text-slate-700 dark:text-slate-200" />
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Organizers
          </h2>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Organizer</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Events</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {organizers.map((org) => (
                  <tr key={org.id} className="text-slate-900 dark:text-white">
                    <td className="px-6 py-5 font-semibold">{org.name}</td>
                    <td className="px-6 py-5 text-slate-600 dark:text-slate-300">
                      {org.email}
                    </td>
                    <td className="px-6 py-5 font-semibold">
                      {org.eventsCount}
                    </td>
                    <td className="px-6 py-5">
                      <StatusPill status={org.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={org.manageHref ?? "#"}
                        className="font-semibold text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminOrganizersSection;
