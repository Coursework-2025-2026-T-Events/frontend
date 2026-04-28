"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import Typography from "@/components/ui/Typography";
import { adminApi } from "@/features/admin/api";
import RequireAuth from "@/features/auth/RequireAuth";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

const initialForm = {
  title: "",
};

const statusLabels: Record<string, string> = {
  draft: "черновик",
  published: "опубликовано",
  active: "активно",
  finished: "завершено",
  archived: "архив",
};

export default function AdminEventsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);

  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    queryFn: adminApi.listEvents,
  });
  const events = eventsQuery.data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: () => adminApi.createEvent({ title: form.title.trim() }),
    onSuccess: (res) => {
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      router.push(routes.adminEvent(res.data.event_id));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  return (
    <RequireAuth allowedRoles={["admin"]}>
      <Container>
        <div className="mx-auto mt-6 max-w-5xl space-y-5 sm:mt-8">
          <PageHeader
            title="Мероприятия"
            description="Создавайте черновики и управляйте публикацией."
            actions={
            <Button variant="secondary" onClick={() => eventsQuery.refetch()} disabled={eventsQuery.isFetching}>
              {eventsQuery.isFetching ? "Обновление..." : "Обновить"}
            </Button>
            }
          />

          <Card>
            <Typography as="h2" size="lg" weight="bold">
              Новый черновик
            </Typography>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
              <Input label="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Создание..." : "Создать"}
              </Button>
            </form>
            {createMutation.error && (
              <ErrorMessage className="mt-3" message={getErrorMessage(createMutation.error, "Не удалось создать мероприятие")} />
            )}
          </Card>

          {eventsQuery.isLoading && <LoadingState message="Загрузка мероприятий..." />}

          {eventsQuery.error && (
            <ErrorMessage
              message={getErrorMessage(eventsQuery.error, "Не удалось загрузить мероприятия")}
              actionLabel={eventsQuery.isFetching ? "Повторяем..." : "Повторить"}
              onAction={() => eventsQuery.refetch()}
            />
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {events.map((event) => (
              <Card key={event.event_id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Typography as="h2" size="lg" weight="bold">
                      {event.title}
                    </Typography>
                    <Typography className="mt-1 text-neutral-500" size="sm">
                      #{event.event_id} · {statusLabels[event.status] ?? "неизвестный статус"}
                    </Typography>
                  </div>
                  <span className="rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-600">
                    {event.direction_count} / {event.game_count}
                  </span>
                </div>
                <Typography className="mt-3 text-neutral-700" size="sm">
                  {event.description || "Описание пока не заполнено"}
                </Typography>
                <Typography className="mt-2 text-neutral-500" size="sm">
                  {event.timezone ?? "Часовой пояс не задан"} · Призы {event.small_reward_percent ?? "?"}% /{" "}
                  {event.big_reward_percent ?? "?"}%
                </Typography>
                <Button className="mt-4 w-full sm:w-auto" href={routes.adminEvent(event.event_id)} variant="secondary">
                  Открыть
                </Button>
              </Card>
            ))}
          </div>

          {!eventsQuery.isLoading && !eventsQuery.error && events.length === 0 && (
            <EmptyState
              title="Мероприятий пока нет"
              description="Создайте первый черновик выше, чтобы начать настройку направлений и игр."
            />
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
