import DashboardHeader from "@/components/DashboardHeader";
import DashboardHero from "@/components/DashboardHero";
import DashboardStatsGrid from "@/components/DashboardStatsGrid";
import OrganizerEventsSection from "@/components/OrganizerEventsSection";
import { LuTrendingUp, LuUsers, LuChartColumnIncreasing } from "react-icons/lu";
import { TbCoin } from "react-icons/tb";

// interface Props {}

const items = [
  {
    title: "Active Events",
    value: 3,
    icon: <LuChartColumnIncreasing size={20} />,
  },
  {
    title: "Total Tickets Sold",
    value: 2092,
    icon: <LuTrendingUp size={20} />,
  },
  { title: "Total Revenue", value: 320758, icon: <TbCoin size={20} /> },
  { title: "Attendees", value: 2092, icon: <LuUsers size={20} /> },
];

function Page() {
  // const {} = props

  return (
    <div className="bg-white dark:bg-slate-950">
      <DashboardHeader role="organizer" email="organizer@example.com" />
      <DashboardHero />
      <DashboardStatsGrid items={items} />
      <OrganizerEventsSection />
    </div>
  );
}

export default Page;

