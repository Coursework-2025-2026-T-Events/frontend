import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import {
  formatInventoryDateTime,
  getInventoryRewardTypeLabel,
} from "@/features/reward/standerInventory";
import type { RedemptionListEntryDTO, RedemptionListPageDTO, RewardType } from "@/lib/api/types";

type InventoryRange = {
  from: number;
  to: number;
  total: number;
};

function rewardTypeClassName(type: RewardType): string {
  return type === "big"
    ? "bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]"
    : "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]";
}

export function RedemptionsSkeleton() {
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

function RewardTypeBadge({ type }: { type: RewardType }) {
  return (
    <span className={clsx("inline-flex rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]", rewardTypeClassName(type))}>
      {getInventoryRewardTypeLabel(type)}
    </span>
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
        <RewardTypeBadge type={item.reward_type} />
      </div>
      <div className="mt-4 grid gap-2 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
        <p>{item.direction_name}</p>
        <p>{formatInventoryDateTime(item.redeemed_at)}</p>
        <p>Выдал: {item.stander_full_name}</p>
      </div>
    </article>
  );
}

function RedemptionsTable({ items }: { items: RedemptionListEntryDTO[] }) {
  return (
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
          {items.map((item) => (
            <tr key={item.redemption_id} className="border-b border-[var(--color-brand-line)] last:border-b-0">
              <td className="py-4 pr-4 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
                {formatInventoryDateTime(item.redeemed_at)}
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
                <RewardTypeBadge type={item.reward_type} />
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
  );
}

export function RedemptionsList({
  eventTitle,
  hasNextPage,
  hasPreviousPage,
  isFetching,
  onNextPage,
  onPreviousPage,
  page,
  rewardsCount,
  visibleRange,
}: {
  eventTitle: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFetching: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  page: RedemptionListPageDTO;
  rewardsCount: { big: number; small: number };
  visibleRange: InventoryRange;
}) {
  return (
    <section className="mt-5 rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:mt-6 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[13px] leading-[18px] text-[var(--color-brand-graphite)]">
            {eventTitle}
          </span>
          <h2 className="mt-3 text-[26px] font-bold leading-8 text-[var(--color-brand-ink)] sm:text-[32px] sm:leading-9">
            Выданные призы
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
          <SummaryStat label="Всего" value={page.total} />
          <SummaryStat label="Малые" value={rewardsCount.small} />
          <SummaryStat label="Большие" value={rewardsCount.big} />
        </div>
      </div>

      {page.items.length > 0 ? (
        <>
          <RedemptionsTable items={page.items} />
          <div className="mt-5 grid gap-3 lg:hidden">
            {page.items.map((item) => (
              <RedemptionMobileCard key={item.redemption_id} item={item} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6">
          <EmptyState title="Выдачи не найдены" description="Попробуйте изменить фильтры или выбрать другое мероприятие." />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-brand-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] leading-5 text-[var(--color-brand-muted)]">
          Показано {visibleRange.from}-{visibleRange.to} из {visibleRange.total}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!hasPreviousPage || isFetching}
            onClick={onPreviousPage}
            className="min-h-10 gap-2 px-4 text-[14px]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Назад
          </Button>
          <Button
            variant="secondary"
            disabled={!hasNextPage || isFetching}
            onClick={onNextPage}
            className="min-h-10 gap-2 px-4 text-[14px]"
          >
            Далее
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  );
}
