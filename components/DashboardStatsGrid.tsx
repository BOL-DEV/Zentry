import DashboardStatCard from "@/components/DashboardStatCard";
import type { ReactNode } from "react";

type StatItem = {
  title: string;
  value: number;
  icon?: ReactNode;
};

type Props = {
  items: StatItem[];
};

function DashboardStatsGrid({ items }: Props) {
  return (
    <section className="bg-white dark:bg-slate-950">
      <div className="mx-auto lg:max-w-7xl px-6 pb-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <DashboardStatCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardStatsGrid;
