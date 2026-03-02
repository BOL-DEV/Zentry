import type { ReactNode } from "react";
import { formatCurrency } from "@/helpers/format";

type Props = {
  title: string;
  value: number;
  icon?: ReactNode;
};

function DashboardStatCard({ title, value, icon }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </p>
          <div className="mt-3 text-4xl font-bold text-purple-900 dark:text-purple-200">
            {title === "Total Revenue" ? formatCurrency(value) : value}
          </div>
        </div>

        {icon ? (
          <div className="text-purple-700 dark:text-purple-400">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardStatCard;
