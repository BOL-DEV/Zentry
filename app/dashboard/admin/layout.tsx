import AdminDashboardLayout from "@/components/AdminDashboardLayout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
