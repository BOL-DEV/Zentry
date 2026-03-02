import DashboardHeader from "@/components/DashboardHeader";
import DashboardHero from "@/components/DashboardHero";
import DashboardStatsGrid from "@/components/DashboardStatsGrid";
import AdminEventsManagementSection from "@/components/EventManagement";
import AdminOrganizersSection from "@/components/AdminOrganizersSection";

// interface Props {}

const items = [
  { title: "Active Events", value: 3 },
  {
    title: "Active Organizers",
    value: 3,
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
      <AdminEventsManagementSection />
      <AdminOrganizersSection />
    </div>
  );
}

export default Page;
