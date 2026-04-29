"use client";

import { FormEvent } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import RequireAuth from "@/features/auth/RequireAuth";
import Select from "@/components/ui/Select";
import { useStanderInventory } from "@/features/reward/useStanderInventory";
import { useIsAuthorized } from "@/features/auth/useIsAuthorized";
import { RedemptionsList, RedemptionsSkeleton } from "@/features/reward/StanderInventoryViews";
import type { RewardType } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function StanderInventoryClient() {
  const isAuthorized = useIsAuthorized();
  const inventory = useStanderInventory(isAuthorized);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    inventory.applyFilters();
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
                  value={inventory.draftFilters.eventId}
                  onChange={(event) => inventory.updateDraftFilter("eventId", event.target.value)}
                  error={inventory.fieldErrors.eventId}
                  required
                >
                  <option value="">Выберите мероприятие</option>
                  {inventory.eventsQuery.data?.data.map((event) => (
                    <option key={event.event_id} value={event.event_id}>
                      {event.title}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Направление"
                  value={inventory.draftFilters.directionId}
                  onChange={(event) => inventory.updateDraftFilter("directionId", event.target.value)}
                  disabled={!inventory.hasDraftEventId || inventory.directionsQuery.isLoading}
                  error={inventory.fieldErrors.directionId}
                >
                  <option value="">Все направления</option>
                  {inventory.directionsQuery.data?.data.map((direction) => (
                    <option key={direction.direction_id} value={direction.direction_id}>
                      {direction.name}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Участник"
                  value={inventory.draftFilters.q}
                  onChange={(event) => inventory.updateDraftFilter("q", event.target.value)}
                  placeholder="Имя или email"
                />
                <Select
                  label="Тип приза"
                  value={inventory.draftFilters.rewardType}
                  onChange={(event) => inventory.updateDraftFilter("rewardType", event.target.value as RewardType | "")}
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
                  <Button type="button" variant="secondary" onClick={inventory.resetFilters} className="min-h-11 gap-2 px-5 text-[15px]">
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Сбросить
                  </Button>
                </div>
              </form>
            </section>

            {!inventory.hasEventId && (
              <div className="mt-5 sm:mt-6">
                <EmptyState
                  title="Выберите мероприятие"
                  description="После выбора мероприятия здесь появится журнал выдачи призов."
                />
              </div>
            )}

            {inventory.redemptionsQuery.isLoading && (
              <div className="mt-5 sm:mt-6">
                <RedemptionsSkeleton />
              </div>
            )}

            {inventory.redemptionsQuery.error && (
              <div className="mt-5 sm:mt-6">
                <ErrorMessage
                  message={getErrorMessage(inventory.redemptionsQuery.error, "Не удалось загрузить журнал выдачи")}
                  actionLabel={inventory.redemptionsQuery.isFetching ? "Повторяем..." : "Повторить"}
                  onAction={() => inventory.redemptionsQuery.refetch()}
                />
              </div>
            )}

            {inventory.page && (
              <RedemptionsList
                eventTitle={inventory.selectedEvent?.title ?? `Мероприятие #${inventory.page.event_id}`}
                hasNextPage={inventory.hasNextPage}
                hasPreviousPage={inventory.hasPreviousPage}
                isFetching={inventory.redemptionsQuery.isFetching}
                onNextPage={inventory.goToNextPage}
                onPreviousPage={inventory.goToPreviousPage}
                page={inventory.page}
                rewardsCount={inventory.rewardsCount}
                visibleRange={inventory.visibleRange}
              />
            )}
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}

