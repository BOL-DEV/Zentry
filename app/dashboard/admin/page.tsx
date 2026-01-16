import DashboardHeader from "@/components/DashboardHeader";
import DashboardHero from "@/components/DashboardHero";
import DashboardStatsGrid from "@/components/DashboardStatsGrid";

// interface Props {}

const items = [
  { title: "Active Events", value: 3 },
  {
    title: "Total Tickets Sold",
    value: 2092,
  },
  { title: "Total Revenue", value: 320758 },
  { title: "Attendees", value: 2092 },
];

function Page() {
  // const {} = props

  return (
    <div className="bg-white dark:bg-slate-950">
      <DashboardHeader role="admin" email="organizer@example.com" />
      <DashboardHero />
      <DashboardStatsGrid items={items} />
    </div>
  );
}

export default Page;
