"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import RequireAuth from "@/features/auth/RequireAuth";
import Select from "@/components/ui/Select";
import { eventsApi } from "@/features/events/api";
import { rewardApi } from "@/features/reward/api";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import type { RedemptionListEntryDTO, RewardType } from "@/lib/api/types";
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

function rewardTypeClassName(type: RewardType) {
  return type === "big"
    ? "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]"
    : "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RedemptionsSkeleton() {
  return (
    <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6" role="status">
      <div className="h-7 w-48 animate-pulse rounded-full bg-[var(--color-brand-line)]" />
      <div className="mt-5 space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-14 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-brand-panel)]" />
        ))}
      </div>
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3">
      <p className="text-[13px] leading-4 text-[var(--color-brand-muted)]">{label}</p>
      <p className="mt-1 text-[20px] font-medium leading-6 text-[var(--color-brand-ink)]">{value}</p>
    </div>
  );
}

function RedemptionMobileCard({ item }: { item: RedemptionListEntryDTO }) {
  return (
    <article className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-medium leading-5 text-[var(--color-brand-ink)]">{item.full_name}</h3>
          <p className="mt-1 truncate text-[13px] leading-5 text-[var(--color-brand-muted)]">{item.email}</p>
        </div>
        <span className={clsx("shrink-0 rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]", rewardTypeClassName(item.reward_type))}>
          {rewardTypeLabel(item.reward_type)}
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
        <p>{item.direction_name}</p>
        <p>{formatDateTime(item.redeemed_at)}</p>
        <p>Выдал: {item.stander_full_name}</p>
      </div>
    </article>
  );
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
  const selectedEvent = eventsQuery.data?.data.find((event) => event.event_id === eventId);
  const hasPreviousPage = offset > 0;
  const hasNextPage = page ? page.offset + page.limit < page.total : false;
  const shownFrom = page && page.total > 0 ? page.offset + 1 : 0;
  const shownTo = page ? Math.min(page.offset + page.limit, page.total) : 0;
  const bigRewardsCount = page?.items.filter((item) => item.reward_type === "big").length ?? 0;
  const smallRewardsCount = page?.items.filter((item) => item.reward_type === "small").length ?? 0;

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOffset(0);
    setAppliedFilters(draftFilters);
  };

  const resetFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setOffset(0);
  };

  return (
    <RequireAuth allowedRoles={["stander", "admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            <section className="rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
              <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
                Стойка выдачи
              </span>
              <h1 className="mt-4 max-w-3xl text-balance text-[30px] font-bold leading-9 text-[var(--color-brand-ink)] sm:mt-5 sm:text-[44px] sm:leading-[48px]">
                Журнал выдачи
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                Проверяйте историю выданного мерча по мероприятию, участнику, направлению и типу приза.
              </p>
            </section>

            <section className="mt-5 rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:mt-6 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
                  <SlidersHorizontal className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-[22px] font-medium leading-7 text-[var(--color-brand-ink)]">Фильтры</h2>
                  <p className="mt-1 text-[14px] leading-5 text-[var(--color-brand-muted)]">
                    Сначала выберите мероприятие, затем уточните список.
                  </p>
                </div>
              </div>

              <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={applyFilters}>
                <Select
                  label="Мероприятие"
                  value={draftFilters.eventId}
                  onChange={(event) => setDraftFilters({ ...draftFilters, eventId: event.target.value, directionId: "" })}
                  required
                >
                  <option value="">Выберите мероприятие</option>
                  {eventsQuery.data?.data.map((event) => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.title}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Направление"
                  value={draftFilters.directionId}
                  onChange={(event) => setDraftFilters({ ...draftFilters, directionId: event.target.value })}
                  disabled={!hasDraftEventId || directionsQuery.isLoading}
                >
                  <option value="">Все направления</option>
                  {directionsQuery.data?.data.map((direction) => (
                    <option key={direction.direction_id} value={direction.direction_id}>
                      {direction.name}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Участник"
                  value={draftFilters.q}
                  onChange={(event) => setDraftFilters({ ...draftFilters, q: event.target.value })}
                  placeholder="Имя или email"
                />
                <Select
                  label="Тип приза"
                  value={draftFilters.rewardType}
                  onChange={(event) => setDraftFilters({ ...draftFilters, rewardType: event.target.value as RewardType | "" })}
                >
                  <option value="">Все призы</option>
                  <option value="small">Малый</option>
                  <option value="big">Большой</option>
                </Select>
                <div className="flex flex-col gap-3 md:col-span-2 md:flex-row xl:col-span-4">
                  <Button type="submit" className="min-h-11 gap-2 px-5 text-[15px]">
                    <Search className="h-4 w-4" aria-hidden />
                    Показать выдачи
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetFilters} className="min-h-11 gap-2 px-5 text-[15px]">
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Сбросить
                  </Button>
                </div>
              </form>
            </section>

            {!hasEventId && (
              <div className="mt-5 sm:mt-6">
                <EmptyState
                  title="Выберите мероприятие"
                  description="После выбора мероприятия здесь появится журнал выдачи призов."
                />
              </div>
            )}

            {redemptionsQuery.isLoading && (
              <div className="mt-5 sm:mt-6">
                <RedemptionsSkeleton />
              </div>
            )}

            {redemptionsQuery.error && (
              <div className="mt-5 sm:mt-6">
                <ErrorMessage
                  message={getErrorMessage(redemptionsQuery.error, "Не удалось загрузить журнал выдачи")}
                  actionLabel={redemptionsQuery.isFetching ? "Повторяем..." : "Повторить"}
                  onAction={() => redemptionsQuery.refetch()}
                />
              </div>
            )}

            {page && (
              <section className="mt-5 rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:mt-6 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[13px] leading-[18px] text-[var(--color-brand-graphite)]">
                      {selectedEvent?.title ?? `Мероприятие #${page.event_id}`}
                    </span>
                    <h2 className="mt-3 text-[26px] font-bold leading-8 text-[var(--color-brand-ink)] sm:text-[32px] sm:leading-9">
                      Выданные призы
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
                    <SummaryStat label="Всего" value={page.total} />
                    <SummaryStat label="Малые" value={smallRewardsCount} />
                    <SummaryStat label="Большие" value={bigRewardsCount} />
                  </div>
                </div>

                {page.items.length > 0 ? (
                  <>
                    <div className="mt-6 hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[960px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--color-brand-line)] text-[13px] leading-5 text-[var(--color-brand-muted)]">
                            <th className="py-3 pr-4 font-medium">Выдано</th>
                            <th className="px-4 py-3 font-medium">Участник</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Направление</th>
                            <th className="px-4 py-3 font-medium">Приз</th>
                            <th className="py-3 pl-4 font-medium">Сотрудник</th>
                          </tr>
                        </thead>
                        <tbody>
                          {page.items.map((item) => (
                            <tr key={item.redemption_id} className="border-b border-[var(--color-brand-line)] last:border-b-0">
                              <td className="py-4 pr-4 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
                                {formatDateTime(item.redeemed_at)}
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-[15px] font-medium leading-5 text-[var(--color-brand-ink)]">{item.full_name}</p>
                                <p className="mt-1 text-[13px] leading-4 text-[var(--color-brand-muted)]">#{item.user_id}</p>
                              </td>
                              <td className="px-4 py-4 text-[14px] leading-5 text-[var(--color-brand-graphite)]">{item.email}</td>
                              <td className="px-4 py-4">
                                <p className="text-[14px] leading-5 text-[var(--color-brand-graphite)]">{item.direction_name}</p>
                                <p className="mt-1 text-[13px] leading-4 text-[var(--color-brand-muted)]">#{item.direction_id}</p>
                              </td>
                              <td className="px-4 py-4">
                                <span className={clsx("inline-flex rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]", rewardTypeClassName(item.reward_type))}>
                                  {rewardTypeLabel(item.reward_type)}
                                </span>
                              </td>
                              <td className="py-4 pl-4">
                                <p className="text-[14px] leading-5 text-[var(--color-brand-graphite)]">{item.stander_full_name}</p>
                                <p className="mt-1 text-[13px] leading-4 text-[var(--color-brand-muted)]">#{item.stander_user_id}</p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 grid gap-3 lg:hidden">
                      {page.items.map((item) => (
                        <RedemptionMobileCard key={item.redemption_id} item={item} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="mt-6">
                    <EmptyState
                      title="Выдачи не найдены"
                      description="Попробуйте изменить фильтры или выбрать другое мероприятие."
                    />
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-brand-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[14px] leading-5 text-[var(--color-brand-muted)]">
                    Показано {shownFrom}-{shownTo} из {page.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      disabled={!hasPreviousPage || redemptionsQuery.isFetching}
                      onClick={() => setOffset(Math.max(0, offset - PAGE_LIMIT))}
                      className="min-h-10 gap-2 px-4 text-[14px]"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Назад
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={!hasNextPage || redemptionsQuery.isFetching}
                      onClick={() => setOffset(offset + PAGE_LIMIT)}
                      className="min-h-10 gap-2 px-4 text-[14px]"
                    >
                      Далее
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}
