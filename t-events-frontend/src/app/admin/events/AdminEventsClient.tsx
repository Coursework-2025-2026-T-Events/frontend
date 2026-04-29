"use client";

import Container from "@/components/ui/Container";
import { DesktopAdminEvents, MobileAdminEvents } from "@/features/admin/AdminEventsViews";
import { useAdminEventsDashboard } from "@/features/admin/useAdminEventsDashboard";
import RequireAuth from "@/features/auth/RequireAuth";

export default function AdminEventsClient() {
  const adminEvents = useAdminEventsDashboard();
  const viewProps = {
    activeEvents: adminEvents.summary.activeEvents,
    createError: adminEvents.createMutation.error,
    draftEvents: adminEvents.summary.draftEvents,
    events: adminEvents.events,
    filteredEvents: adminEvents.filteredEvents,
    formTitle: adminEvents.formTitle,
    isCreating: adminEvents.createMutation.isPending,
    isLoading: adminEvents.eventsQuery.isLoading,
    loadError: adminEvents.eventsQuery.error,
    onFormTitleChange: adminEvents.setFormTitle,
    onSubmit: adminEvents.handleSubmit,
    readyEvents: adminEvents.summary.readyEvents,
    search: adminEvents.search,
    statusFilter: adminEvents.statusFilter,
    totalEvents: adminEvents.summary.totalEvents,
    onSearchChange: adminEvents.setSearch,
    onStatusChange: adminEvents.setStatusFilter,
  };

  return (
    <RequireAuth allowedRoles={["admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-10 lg:pb-14">
        <Container>
          <MobileAdminEvents {...viewProps} />
          <DesktopAdminEvents {...viewProps} />
        </Container>
      </div>
    </RequireAuth>
  );
}
