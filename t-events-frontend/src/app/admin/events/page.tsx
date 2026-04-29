"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Archive, CalendarClock, CheckCircle2, CircleDashed, Gamepad2, Map, Plus, Search } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/ui/LoadingState";
import { adminApi } from "@/features/admin/api";
import RequireAuth from "@/features/auth/RequireAuth";
import type { AdminEventDTO, EventStatus } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

const initialForm = { title: "" };

const statusMeta: Record<EventStatus, { label: string; tone: string; dot: string }> = {
  draft: { label: "Черновик", tone: "bg-[#f1f3f6] text-[var(--color-brand-graphite)]", dot: "bg-[#8a94a6]" },
  published: { label: "Опубликовано", tone: "bg-[#eef5ff] text-[#126df7]", dot: "bg-[#126df7]" },
  active: { label: "Активно", tone: "bg-[#eaf7ee] text-[#237a3b]", dot: "bg-[#35b55b]" },
  finished: { label: "Завершено", tone: "bg-[#fff7cf] text-[var(--color-brand-ink)]", dot: "bg-[#d9a900]" },
  archived: { label: "Архив", tone: "bg-[#fdecec] text-[#b42318]", dot: "bg-[#d04437]" },
};

const statusOptions: Array<{ value: "all" | EventStatus; label: string; shortLabel: string }> = [
  { value: "all", label: "Все", shortLabel: "Все" },
  { value: "draft", label: "Черновики", shortLabel: "Черновики" },
  { value: "published", label: "Опубликованные", shortLabel: "Опубл." },
  { value: "active", label: "Активные", shortLabel: "Активные" },
  { value: "finished", label: "Завершённые", shortLabel: "Заверш." },
  { value: "archived", label: "Архив", shortLabel: "Архив" },
];

function formatDateTime(value: string | null) {
  if (!value) return "Не задано";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEventWindow(event: AdminEventDTO) {
  if (!event.start_time && !event.end_time) return "Расписание не задано";
  return `${formatDateTime(event.start_time)} - ${formatDateTime(event.end_time)}`;
}

function sortEvents(events: AdminEventDTO[]) {
  return [...events].sort((left, right) => {
    const leftTime = Date.parse(left.updated_at ?? left.created_at);
    const rightTime = Date.parse(right.updated_at ?? right.created_at);
    return rightTime - leftTime;
  });
}

function getReadyEventsCount(events: AdminEventDTO[]) {
  return events.filter((event) => event.direction_count > 0 && event.game_count > 0).length;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EventStatus>("all");

  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    queryFn: adminApi.listEvents,
  });

  const events = useMemo(() => eventsQuery.data?.data ?? [], [eventsQuery.data?.data]);
  const filteredEvents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortEvents(events).filter((event) => {
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.description.toLowerCase().includes(normalizedSearch) ||
        String(event.event_id).includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [events, search, statusFilter]);

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
    if (!form.title.trim()) return;
    createMutation.mutate();
  };

  const activeEvents = events.filter((event) => event.status === "active").length;
  const draftEvents = events.filter((event) => event.status === "draft").length;
  const readyEvents = getReadyEventsCount(events);

  return (
    <RequireAuth allowedRoles={["admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-10 lg:pb-14">
        <Container>
          <MobileAdminEvents
            activeEvents={activeEvents}
            createError={createMutation.error}
            draftEvents={draftEvents}
            events={events}
            filteredEvents={filteredEvents}
            formTitle={form.title}
            isCreating={createMutation.isPending}
            isLoading={eventsQuery.isLoading}
            loadError={eventsQuery.error}
            onFormTitleChange={(title) => setForm({ title })}
            onSubmit={handleSubmit}
            readyEvents={readyEvents}
            search={search}
            statusFilter={statusFilter}
            totalEvents={events.length}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
          />

          <DesktopAdminEvents
            activeEvents={activeEvents}
            createError={createMutation.error}
            draftEvents={draftEvents}
            events={events}
            filteredEvents={filteredEvents}
            formTitle={form.title}
            isCreating={createMutation.isPending}
            isLoading={eventsQuery.isLoading}
            loadError={eventsQuery.error}
            onFormTitleChange={(title) => setForm({ title })}
            onSubmit={handleSubmit}
            readyEvents={readyEvents}
            search={search}
            statusFilter={statusFilter}
            totalEvents={events.length}
            onSearchChange={setSearch}
            onStatusChange={setStatusFilter}
          />
        </Container>
      </div>
    </RequireAuth>
  );
}

type EventsViewProps = {
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
  onStatusChange: (status: "all" | EventStatus) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readyEvents: number;
  search: string;
  statusFilter: "all" | EventStatus;
  totalEvents: number;
};

function MobileAdminEvents(props: EventsViewProps) {
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

function DesktopAdminEvents(props: EventsViewProps) {
  return (
    <div className="hidden py-10 lg:block">
      <section className="rounded-[var(--radius-lg)] bg-white p-8 shadow-[var(--shadow-card)]">
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

function CreateEventForm({
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

function StatusFilter({
  className,
  compact = false,
  value,
  onChange,
}: {
  className?: string;
  compact?: boolean;
  value: "all" | EventStatus;
  onChange: (status: "all" | EventStatus) => void;
}) {
  return (
    <div className={clsx("flex gap-2 lg:flex-wrap", className)}>
      {statusOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "min-h-10 shrink-0 rounded-[var(--radius-md)] px-3 text-[14px] leading-5 outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]",
            value === option.value
              ? "bg-[var(--color-brand-ink)] text-white"
              : "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)] hover:bg-[#e7e9ee]"
          )}
        >
          {compact ? option.shortLabel : option.label}
        </button>
      ))}
    </div>
  );
}

function EventsResultState({
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
    return (
      <ErrorMessage
        message={getErrorMessage(loadError, "Не удалось загрузить мероприятия")}
      />
    );
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
        mobile ? <MobileEventItem key={event.event_id} event={event} /> : <EventCard key={event.event_id} event={event} />
      )}
    </div>
  );
}

function MobileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-white px-3 py-2 shadow-[var(--shadow-card)]">
      <p className="text-[12px] leading-4 text-[var(--color-brand-muted)]">{label}</p>
      <p className="mt-1 text-[22px] font-bold leading-7 text-[var(--color-brand-ink)]">{value}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
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
  const status = statusMeta[event.status];
  const isReady = event.direction_count > 0 && event.game_count > 0;

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
        <span className="min-w-0 truncate">{getEventWindow(event)}</span>
        <span className={clsx("shrink-0", isReady ? "text-[#237a3b]" : "text-[var(--color-brand-muted)]")}>
          {isReady ? "Готово" : "Настроить"}
        </span>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: AdminEventDTO }) {
  const status = statusMeta[event.status];
  const isReady = event.direction_count > 0 && event.game_count > 0;

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
        <InfoPill icon={CalendarClock} label="Расписание" value={getEventWindow(event)} />
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
