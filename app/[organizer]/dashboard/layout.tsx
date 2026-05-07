import OrganizerDashboardLayout from "@/components/OrganizerDashboardLayout";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return <OrganizerDashboardLayout>{children}</OrganizerDashboardLayout>;
}

export default Layout;
