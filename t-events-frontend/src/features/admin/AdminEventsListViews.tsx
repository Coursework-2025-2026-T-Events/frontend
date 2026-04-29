import Link from "next/link";
import type { FormEvent } from "react";
import { Archive, CalendarClock, CheckCircle2, Gamepad2, Map, Plus } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/ui/LoadingState";
import type { AdminEventDTO } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";
import {
  adminEventStatusMeta,
  adminEventStatusOptions,
  getAdminEventWindow,
  isAdminEventReady,
  type AdminEventStatusFilter,
} from "./adminEventsPresentation";

export function CreateEventForm({
  className,
  createError,
  formTitle,
  id = "new-event-form",
  isCreating,
  onFormTitleChange,
  onSubmit,
}: {
  className?: string;
  createError: unknown;
  formTitle: string;
  id?: string;
  isCreating: boolean;
  onFormTitleChange: (title: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form id={id} className={clsx("rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] sm:p-6", className)} onSubmit={onSubmit}>
      <div className="flex items-start gap-3 lg:block">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] text-[var(--color-brand-ink)]">
          <Plus className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-[20px] font-medium leading-6 text-[var(--color-brand-ink)] lg:mt-4 lg:text-[22px] lg:leading-7">
            Новый черновик
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-[var(--color-brand-graphite)] sm:text-[14px] lg:mt-2">
            Достаточно названия. Остальное настраивается после создания.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 lg:mt-5">
        <Input
          label="Название"
          value={formTitle}
          onChange={(event) => onFormTitleChange(event.target.value)}
          placeholder="Например, День открытых дверей"
          required
        />
        <Button type="submit" disabled={isCreating || !formTitle.trim()} className="min-h-11 w-full gap-2 px-5 text-[15px]">
          <Plus className="h-4 w-4" aria-hidden />
          {isCreating ? "Создаём" : "Создать черновик"}
        </Button>
      </div>

      {Boolean(createError) && (
        <ErrorMessage className="mt-4" message={getErrorMessage(createError, "Не удалось создать мероприятие")} />
      )}
    </form>
  );
}

export function StatusFilter({
  className,
  compact = false,
  value,
  onChange,
}: {
  className?: string;
  compact?: boolean;
  value: AdminEventStatusFilter;
  onChange: (status: AdminEventStatusFilter) => void;
}) {
  return (
    <div className={clsx("flex gap-2 lg:flex-wrap", className)}>
      {adminEventStatusOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "min-h-10 shrink-0 rounded-[var(--radius-md)] px-3 text-[14px] leading-5 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]",
            value === option.value
              ? "bg-[var(--color-brand-ink)] text-white"
              : "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)] hover:bg-[#e7e9ee]",
          )}
        >
          {compact ? option.shortLabel : option.label}
        </button>
      ))}
    </div>
  );
}

export function EventsResultState({
  events,
  filteredEvents,
  isLoading,
  loadError,
  mobile = false,
}: {
  events: AdminEventDTO[];
  filteredEvents: AdminEventDTO[];
  isLoading: boolean;
  loadError: unknown;
  mobile?: boolean;
}) {
  if (isLoading) return <LoadingState message="Загрузка мероприятий..." />;

  if (loadError) {
    return <ErrorMessage message={getErrorMessage(loadError, "Не удалось загрузить мероприятия")} />;
  }

  if (events.length > 0 && filteredEvents.length === 0) {
    return (
      <EmptyState
        title="Ничего не найдено"
        description="Измените поиск или фильтр статуса, чтобы вернуть мероприятия в список."
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="Мероприятий пока нет"
        description="Создайте первый черновик, чтобы настроить направления, игры, расписание и призовые пороги."
      />
    );
  }

  return (
    <div className={clsx("grid gap-3", mobile && "gap-2")}>
      {filteredEvents.map((event) =>
        mobile ? <MobileEventItem key={event.event_id} event={event} /> : <EventCard key={event.event_id} event={event} />,
      )}
    </div>
  );
}

export function MobileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-white px-3 py-2 shadow-[var(--shadow-card)]">
      <p className="text-[12px] leading-4 text-[var(--color-brand-muted)]">{label}</p>
      <p className="mt-1 text-[22px] font-bold leading-7 text-[var(--color-brand-ink)]">{value}</p>
    </div>
  );
}

export function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3">
      <div className="flex items-center gap-2 text-[13px] leading-4 text-[var(--color-brand-muted)]">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-[26px] font-bold leading-8 text-[var(--color-brand-ink)]">{value}</p>
    </div>
  );
}

function MobileEventItem({ event }: { event: AdminEventDTO }) {
  const status = adminEventStatusMeta[event.status];
  const isReady = isAdminEventReady(event);

  return (
    <Link
      href={routes.adminEvent(event.event_id)}
      className="block rounded-[var(--radius-lg)] bg-white p-4 shadow-[var(--shadow-card)] outline-none transition active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium leading-4", status.tone)}>
              <span className={clsx("h-1.5 w-1.5 rounded-full", status.dot)} aria-hidden />
              {status.label}
            </span>
            <span className="text-[12px] leading-4 text-[var(--color-brand-muted)]">#{event.event_id}</span>
          </div>
          <h2 className="mt-2 line-clamp-2 text-[18px] font-bold leading-6 text-[var(--color-brand-ink)]">{event.title}</h2>
        </div>
        <span className="shrink-0 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-2 py-1 text-[12px] leading-4 text-[var(--color-brand-graphite)]">
          {event.direction_count}/{event.game_count}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[13px] leading-5 text-[var(--color-brand-muted)]">
        <span className="min-w-0 truncate">{getAdminEventWindow(event)}</span>
        <span className={clsx("shrink-0", isReady ? "text-[#237a3b]" : "text-[var(--color-brand-muted)]")}>
          {isReady ? "Готово" : "Настроить"}
        </span>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: AdminEventDTO }) {
  const status = adminEventStatusMeta[event.status];
  const isReady = isAdminEventReady(event);

  return (
    <article className="rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium leading-4", status.tone)}>
              <span className={clsx("h-1.5 w-1.5 rounded-full", status.dot)} aria-hidden />
              {status.label}
            </span>
            <span className="text-[13px] leading-4 text-[var(--color-brand-muted)]">#{event.event_id}</span>
          </div>
          <h2 className="mt-3 text-[22px] font-bold leading-7 text-[var(--color-brand-ink)]">{event.title}</h2>
          <p className="mt-2 line-clamp-2 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
            {event.description || "Описание пока не заполнено."}
          </p>
        </div>

        <Button href={routes.adminEvent(event.event_id)} variant="secondary" className="min-h-11 shrink-0 px-5 text-[15px]">
          Открыть
        </Button>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-4">
        <InfoPill icon={CalendarClock} label="Расписание" value={getAdminEventWindow(event)} />
        <InfoPill icon={Map} label="Направления" value={String(event.direction_count)} />
        <InfoPill icon={Gamepad2} label="Игры" value={String(event.game_count)} />
        <InfoPill
          icon={event.status === "archived" ? Archive : CheckCircle2}
          label="Готовность"
          value={isReady ? "Можно проверять публикацию" : "Нужна настройка"}
        />
      </div>
    </article>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3">
      <div className="flex items-center gap-2 text-[12px] leading-4 text-[var(--color-brand-muted)]">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </div>
      <p className="mt-1 text-[14px] leading-5 text-[var(--color-brand-ink)]">{value}</p>
    </div>
  );
}
