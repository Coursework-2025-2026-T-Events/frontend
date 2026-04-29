import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";
import { adminApi } from "./api";
import {
  filterAdminEvents,
  getAdminEventsSummary,
  type AdminEventStatusFilter,
} from "./adminEventsPresentation";

const initialCreateEventForm = { title: "" };

export function useAdminEventsDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialCreateEventForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminEventStatusFilter>("all");

  const eventsQuery = useQuery({
    queryKey: queryKeys.admin.events,
    queryFn: adminApi.listEvents,
  });

  const events = useMemo(() => eventsQuery.data?.data ?? [], [eventsQuery.data?.data]);
  const filteredEvents = useMemo(() => filterAdminEvents(events, search, statusFilter), [events, search, statusFilter]);
  const summary = useMemo(() => getAdminEventsSummary(events), [events]);

  const createMutation = useMutation({
    mutationFn: () => adminApi.createEvent({ title: form.title.trim() }),
    onSuccess: (res) => {
      setForm(initialCreateEventForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.events });
      router.push(routes.adminEvent(res.data.event_id));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    createMutation.mutate();
  };

  return {
    createMutation,
    events,
    eventsQuery,
    filteredEvents,
    formTitle: form.title,
    handleSubmit,
    search,
    setFormTitle: (title: string) => setForm({ title }),
    setSearch,
    setStatusFilter,
    statusFilter,
    summary,
  };
}
