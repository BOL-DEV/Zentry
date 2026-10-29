"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Card from "@/components/Card";
import FullPageLoader from "@/components/FullPageLoader";
import OrganizerEventsSection from "@/components/OrganizerEventsSection";
import WorkspaceTopbar from "@/components/WorkspaceTopbar";
import { clearAuthToken } from "@/helpers/auth";
import { isAuthIssue } from "@/helpers/auth-redirect";
import { useAuthSession } from "@/helpers/auth-client";
import { getOrganizerDashboardData } from "@/helpers/organizer-api";

function OrganizerDashboardEventsClient({ organizer }: { organizer: string }) {
  const router = useRouter();
  const { token, user: authUser } = useAuthSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizer-dashboard-events", organizer],
    queryFn: () => getOrganizerDashboardData(organizer),
    enabled: Boolean(token) && authUser?.role !== "staff",
  });

  useEffect(() => {
    if (!token) {
      router.replace(`/login?next=/${organizer}/dashboard/events&reason=auth-required`);
    }
  }, [organizer, router, token]);

  useEffect(() => {
    if (!isAuthIssue(error)) return;

    clearAuthToken();
    router.replace(`/login?next=/${organizer}/dashboard/events&reason=session-expired`);
  }, [error, organizer, router]);

  if (!token) {
    return <FullPageLoader title="Redirecting to login" description="Taking you back to sign in." />;
  }

  useEffect(() => {
    if (authUser?.role === "staff") {
      router.replace(`/${organizer}/staff`);
    }
  }, [authUser?.role, organizer, router]);

  if (authUser?.role === "staff") {
    return (
      <FullPageLoader
        title="Opening check-in area"
        description="Taking you straight to your check-in workspace."
      />
    );
  }

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (error || !data) {
    return (
      <main className="bg-purple-100 dark:bg-slate-950/90">
        <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-10">
          <Card>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error instanceof Error
                ? error.message
                : "We couldn't load your events right now."}
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-purple-100 dark:bg-slate-950/90">
      <div className="mx-auto lg:max-w-7xl px-6 pt-28 pb-6">
        <WorkspaceTopbar
          eyebrow="Manage Events"
          title="All your events in one place."
          description="Open any event, check ticket performance, and jump straight into check-in tools."
          backHref={`/${organizer}/dashboard`}
          backLabel="Back to Dashboard"
          showLogoutButton={false}
          showActions={false}
        />
      </div>

      <OrganizerEventsSection events={data.events} organizer={organizer} />
    </main>
  );
}

export default OrganizerDashboardEventsClient;
