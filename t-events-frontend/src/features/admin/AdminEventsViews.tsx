import { FormEvent, useState } from "react";
import { CalendarClock, CheckCircle2, CircleDashed, FileClock, Gamepad2, Plus, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { AdminEventDTO } from "@/lib/api/types";
import { routes } from "@/lib/routes";
import type { AdminEventStatusFilter } from "./adminEventsPresentation";
import {
  CreateEventForm,
  EventsResultState,
  Metric,
  MobileStat,
  StatusFilter,
} from "./AdminEventsListViews";

export type AdminEventsViewProps = {
  activeEvents: number;
  createError: unknown;
  draftEvents: number;
  events: AdminEventDTO[];
  filteredEvents: AdminEventDTO[];
  formTitle: string;
  isCreating: boolean;
  isLoading: boolean;
  loadError: unknown;
  onFormTitleChange: (title: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: AdminEventStatusFilter) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readyEvents: number;
  search: string;
  statusFilter: AdminEventStatusFilter;
  totalEvents: number;
};

export function MobileAdminEvents(props: AdminEventsViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="py-4 lg:hidden">
      <section className="px-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
              Админ-панель
            </span>
            <h1 className="mt-3 text-[28px] font-bold leading-8 text-[var(--color-brand-ink)]">Мероприятия</h1>
          </div>
          <Button type="button" onClick={() => setIsCreateOpen((value) => !value)} className="min-h-10 shrink-0 gap-1.5 px-3 text-[14px]" aria-expanded={isCreateOpen} aria-controls="mobile-new-event-form">
            <Plus className="h-4 w-4" aria-hidden />
            Новый
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MobileStat label="Всего" value={props.totalEvents} />
          <MobileStat label="Активные" value={props.activeEvents} />
          <MobileStat label="Черновики" value={props.draftEvents} />
        </div>

        <Button href={routes.adminAuditLogs} variant="secondary" className="mt-3 min-h-10 w-full gap-2 text-[14px]">
          <FileClock className="h-4 w-4" aria-hidden />
          Журнал аудита
        </Button>
      </section>

      {isCreateOpen && (
        <CreateEventForm
          id="mobile-new-event-form"
          className="mt-4"
          createError={props.createError}
          formTitle={props.formTitle}
          isCreating={props.isCreating}
          onFormTitleChange={props.onFormTitleChange}
          onSubmit={props.onSubmit}
        />
      )}

      <section className="sticky top-16 z-20 -mx-4 mt-4 border-y border-[var(--color-brand-line)] bg-[var(--color-brand-mist)]/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-[var(--color-brand-muted)]" aria-hidden />
          <Input
            label="Поиск"
            value={props.search}
            onChange={(event) => props.onSearchChange(event.target.value)}
            placeholder="Название или ID"
            className="pl-10"
          />
        </div>
        <StatusFilter
          className="-mx-1 mt-3 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          compact
          value={props.statusFilter}
          onChange={props.onStatusChange}
        />
      </section>

      <section className="mt-4">
        <EventsResultState
          events={props.events}
          filteredEvents={props.filteredEvents}
          isLoading={props.isLoading}
          loadError={props.loadError}
          mobile
        />
      </section>
    </div>
  );
}

export function DesktopAdminEvents(props: AdminEventsViewProps) {
  return (
    <div className="hidden py-10 lg:block">
      <section className="rounded-[var(--radius-lg)] bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
              Администрирование
            </span>
            <h1 className="mt-4 text-[40px] font-bold leading-[44px] text-[var(--color-brand-ink)]">
              Управление мероприятиями
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
              Создавайте черновики, проверяйте готовность направлений и быстро переходите к настройке публикации.
            </p>
          </div>

          <Button href={routes.adminAuditLogs} variant="secondary" className="shrink-0 gap-2">
            <FileClock className="h-4 w-4" aria-hidden />
            Журнал аудита
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          <Metric icon={CalendarClock} label="Всего" value={props.totalEvents} />
          <Metric icon={CheckCircle2} label="Активные" value={props.activeEvents} />
          <Metric icon={CircleDashed} label="Черновики" value={props.draftEvents} />
          <Metric icon={Gamepad2} label="С направлениями и играми" value={props.readyEvents} />
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <CreateEventForm
          createError={props.createError}
          formTitle={props.formTitle}
          isCreating={props.isCreating}
          onFormTitleChange={props.onFormTitleChange}
          onSubmit={props.onSubmit}
        />

        <div className="min-w-0">
          <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-[var(--color-brand-muted)]" aria-hidden />
                <Input
                  label="Поиск"
                  value={props.search}
                  onChange={(event) => props.onSearchChange(event.target.value)}
                  placeholder="Название, описание или ID"
                  className="pl-10"
                />
              </div>
              <StatusFilter value={props.statusFilter} onChange={props.onStatusChange} />
            </div>
          </section>

          <section className="mt-4">
            <EventsResultState
              events={props.events}
              filteredEvents={props.filteredEvents}
              isLoading={props.isLoading}
              loadError={props.loadError}
            />
          </section>
        </div>
      </section>
    </div>
  );
}
