"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import RequireAuth from "@/features/auth/RequireAuth";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { eventsApi } from "@/features/events/api";
import { rewardApi } from "@/features/reward/api";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import type { RewardType } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";

const PAGE_LIMIT = 20;

type Filters = {
  eventId: string;
  q: string;
  directionId: string;
  rewardType: RewardType | "";
};

const initialFilters: Filters = {
  eventId: "",
  q: "",
  directionId: "",
  rewardType: "",
};

function rewardTypeLabel(type: RewardType): string {
  return type === "big" ? "Большой" : "Малый";
}

export default function StanderInventoryPage() {
  const isAuthorized = useIsAuthorized();
  const [draftFilters, setDraftFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  const [offset, setOffset] = useState(0);
  const eventId = Number(appliedFilters.eventId);
  const hasEventId = Number.isFinite(eventId) && eventId > 0;
  const draftEventId = Number(draftFilters.eventId);
  const hasDraftEventId = Number.isFinite(draftEventId) && draftEventId > 0;

  const eventsQuery = useQuery({
    queryKey: ["events", "inventory-filter-options"],
    queryFn: eventsApi.list,
    enabled: isAuthorized,
  });

  const directionsQuery = useQuery({
    queryKey: ["directions", "inventory-filter-options", draftEventId],
    queryFn: () => eventsApi.directions(draftEventId),
    enabled: isAuthorized && hasDraftEventId,
  });

  const redemptionsQuery = useQuery({
    queryKey: ["stander", "event-redemptions", appliedFilters, offset],
    queryFn: () =>
      rewardApi.listEventRedemptions(eventId, {
        q: appliedFilters.q.trim() || undefined,
        direction_id: appliedFilters.directionId ? Number(appliedFilters.directionId) : undefined,
        reward_type: appliedFilters.rewardType || undefined,
        limit: PAGE_LIMIT,
        offset,
      }),
    enabled: hasEventId,
  });

  const page = redemptionsQuery.data?.data;
  const hasPreviousPage = offset > 0;
  const hasNextPage = page ? page.offset + page.limit < page.total : false;

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(draftFilters);
  };

  return (
    <RequireAuth allowedRoles={["stander", "admin"]}>
      <Container>
        <div className="mx-auto mt-6 max-w-6xl space-y-5 sm:mt-8">
          <PageHeader
            title="Выдачи призов"
            description="Ищите выданные призы по мероприятию, участнику, направлению или типу приза."
          />

          <Card>
            <Typography as="h2" size="lg" weight="bold">
              Фильтры
            </Typography>
            <form className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={applyFilters}>
              <Select
                label="Мероприятие из списка"
                value={draftFilters.eventId}
                onChange={(e) => setDraftFilters({ ...draftFilters, eventId: e.target.value, directionId: "" })}
                required
              >
                <option value="">Выберите мероприятие</option>
                {eventsQuery.data?.data.map((event) => (
                  <option key={event.event_id} value={event.event_id}>
                    {event.title} · #{event.event_id}
                  </option>
                ))}
              </Select>
              <Select
                label="Направление из списка"
                value={draftFilters.directionId}
                onChange={(e) => setDraftFilters({ ...draftFilters, directionId: e.target.value })}
                disabled={!hasDraftEventId || directionsQuery.isLoading}
              >
                <option value="">Все направления</option>
                {directionsQuery.data?.data.map((direction) => (
                  <option key={direction.direction_id} value={direction.direction_id}>
                    {direction.name} · #{direction.direction_id}
                  </option>
                ))}
              </Select>
              <Input
                label="Имя или электронная почта"
                value={draftFilters.q}
                onChange={(e) => setDraftFilters({ ...draftFilters, q: e.target.value })}
              />
              <Select
                label="Тип приза"
                value={draftFilters.rewardType}
                onChange={(e) => setDraftFilters({ ...draftFilters, rewardType: e.target.value as RewardType | "" })}
              >
                <option value="">Все</option>
                <option value="small">Малый</option>
                <option value="big">Большой</option>
              </Select>
              <div className="flex gap-3 md:col-span-2 lg:col-span-4">
                <Button type="submit">Найти</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setDraftFilters(initialFilters);
                    setAppliedFilters(initialFilters);
                    setOffset(0);
                  }}
                >
                  Сбросить
                </Button>
              </div>
            </form>
          </Card>

          {!hasEventId && (
            <EmptyState
              title="Выберите мероприятие"
              description="После выбора мероприятия здесь появится список выданных призов."
            />
          )}

          {redemptionsQuery.isLoading && (
            <LoadingState message="Загрузка выданных призов..." />
          )}

          {redemptionsQuery.error && (
            <ErrorMessage
              message={getErrorMessage(redemptionsQuery.error, "Не удалось загрузить выданные призы")}
              actionLabel={redemptionsQuery.isFetching ? "Повторяем..." : "Повторить"}
              onAction={() => redemptionsQuery.refetch()}
            />
          )}

          {page && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Typography as="h2" size="lg" weight="bold">
                  Мероприятие #{page.event_id}
                </Typography>
                <Typography className="text-neutral-600" size="sm">
                  Всего: {page.total}
                </Typography>
              </div>

              {page.items.length > 0 ? (
                <>
                <div className="mt-4 hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[860px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-left text-neutral-500">
                        <th className="py-2 pr-3 font-medium">Выдано</th>
                        <th className="px-3 py-2 font-medium">Участник</th>
                        <th className="px-3 py-2 font-medium">Электронная почта</th>
                        <th className="px-3 py-2 font-medium">Направление</th>
                        <th className="px-3 py-2 font-medium">Приз</th>
                        <th className="py-2 pl-3 font-medium">Выдал</th>
                      </tr>
                    </thead>
                    <tbody>
                      {page.items.map((item) => (
                        <tr key={item.redemption_id} className="border-b border-neutral-100">
                          <td className="py-2 pr-3">{new Date(item.redeemed_at).toLocaleString("ru-RU")}</td>
                          <td className="px-3 py-2">
                            {item.full_name}
                            <span className="ml-2 text-xs text-neutral-500">#{item.user_id}</span>
                          </td>
                          <td className="px-3 py-2">{item.email}</td>
                          <td className="px-3 py-2">
                            {item.direction_name}
                            <span className="ml-2 text-xs text-neutral-500">#{item.direction_id}</span>
                          </td>
                          <td className="px-3 py-2">{rewardTypeLabel(item.reward_type)}</td>
                          <td className="py-2 pl-3">
                            {item.stander_full_name}
                            <span className="ml-2 text-xs text-neutral-500">#{item.stander_user_id}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid gap-3 md:hidden">
                  {page.items.map((item) => (
                    <div key={item.redemption_id} className="rounded-[var(--radius-md)] border border-neutral-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Typography weight="bold">{item.full_name}</Typography>
                          <Typography className="mt-1 text-neutral-500" size="sm">
                            {item.email}
                          </Typography>
                        </div>
                        <span className="rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-700">
                          {rewardTypeLabel(item.reward_type)}
                        </span>
                      </div>
                      <Typography className="mt-3 text-neutral-700" size="sm">
                        {item.direction_name} · {new Date(item.redeemed_at).toLocaleString("ru-RU")}
                      </Typography>
                      <Typography className="mt-1 text-neutral-500" size="sm">
                        Выдал: {item.stander_full_name}
                      </Typography>
                    </div>
                  ))}
                </div>
                </>
              ) : (
                <EmptyState
                  className="mt-4"
                  title="Выдачи не найдены"
                  description="Попробуйте изменить фильтры или выбрать другое мероприятие."
                />
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Typography className="text-neutral-500" size="sm">
                  Показано {page.total === 0 ? 0 : page.offset + 1}-{Math.min(page.offset + page.limit, page.total)} из {page.total}
                </Typography>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={!hasPreviousPage || redemptionsQuery.isFetching}
                    onClick={() => setOffset(Math.max(0, offset - PAGE_LIMIT))}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!hasNextPage || redemptionsQuery.isFetching}
                    onClick={() => setOffset(offset + PAGE_LIMIT)}
                  >
                    Далее
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </RequireAuth>
  );
}
