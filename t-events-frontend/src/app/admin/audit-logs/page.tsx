"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, Download, FileClock, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import LiveStatus from "@/components/ui/LiveStatus";
import Select from "@/components/ui/Select";
import { adminApi } from "@/features/admin/api";
import {
  buildAuditExportQuery,
  type AuditExportFieldErrors,
  type AuditExportForm,
} from "@/features/admin/auditLogExport";
import RequireAuth from "@/features/auth/RequireAuth";
import type { AuditAction, AuditEntityType } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";

const initialForm: AuditExportForm = {
  actor_user_id: "",
  event_id: "",
  action: "",
  entity_type: "",
  from: "",
  to: "",
  limit: "1000",
  offset: "0",
};

const actionOptions: Array<{ value: AuditAction; label: string }> = [
  { value: "admin.event.create", label: "Создание мероприятия" },
  { value: "admin.event.update", label: "Изменение мероприятия" },
  { value: "admin.event.schedule_update", label: "Изменение расписания" },
  { value: "admin.event.direction_add", label: "Добавление направления" },
  { value: "admin.event.direction_remove", label: "Удаление направления" },
  { value: "admin.event.publish", label: "Публикация мероприятия" },
  { value: "admin.event.archive", label: "Архивация мероприятия" },
  { value: "admin.event_game.create", label: "Добавление игры" },
  { value: "admin.event_game.update", label: "Изменение игры" },
  { value: "admin.event_game.delete", label: "Удаление игры" },
  { value: "reward.redemption.create", label: "Выдача награды" },
];

const entityTypeOptions: Array<{ value: AuditEntityType; label: string }> = [
  { value: "event", label: "Мероприятие" },
  { value: "direction", label: "Направление" },
  { value: "event_game", label: "Игра мероприятия" },
  { value: "reward_redemption", label: "Выдача награды" },
];

const quickRanges = [
  { label: "Сегодня", days: 0 },
  { label: "7 дней", days: 7 },
  { label: "30 дней", days: 30 },
];

const presetFilters: Array<{ label: string; values: Partial<AuditExportForm>; days?: number }> = [
  { label: "Публикации", values: { action: "admin.event.publish", entity_type: "event" }, days: 30 },
  { label: "Выдачи наград", values: { action: "reward.redemption.create", entity_type: "reward_redemption" }, days: 7 },
  { label: "Изменения игр", values: { entity_type: "event_game" }, days: 30 },
];

type PreviewRow = {
  audit_log_id: string;
  created_at: string;
  actor_full_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  event_id: string;
};

function toDateTimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatExportTime(value: Date | null): string {
  if (!value) return "";
  return value.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActionLabel(value: string): string {
  return actionOptions.find((option) => option.value === value)?.label ?? value;
}

function getEntityTypeLabel(value: string): string {
  return entityTypeOptions.find((option) => option.value === value)?.label ?? value;
}

function getExportFilename(page: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `audit-journal-${today}-page-${page || "1"}.csv`;
}

function countCsvDataRows(csv: string): number {
  const trimmed = csv.trim();
  if (!trimmed) return 0;
  return Math.max(trimmed.split(/\r?\n/).length - 1, 0);
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

function parsePreviewRows(csv: string): PreviewRow[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  const [headerLine, ...rowLines] = lines;
  if (!headerLine) return [];

  const headers = parseCsvLine(headerLine);
  return rowLines.map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    return {
      audit_log_id: row.audit_log_id ?? "",
      created_at: row.created_at ?? "",
      actor_full_name: row.actor_full_name ?? "",
      action: row.action ?? "",
      entity_type: row.entity_type ?? "",
      entity_id: row.entity_id ?? "",
      event_id: row.event_id ?? "",
    };
  });
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function AdminAuditLogsPage() {
  const [form, setForm] = useState(initialForm);
  const [page, setPage] = useState("1");
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [previewError, setPreviewError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<AuditExportFieldErrors>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{ at: Date; rowCount: number } | null>(null);
  const lastExportedAt = lastExport?.at ?? null;
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  const eventsQuery = useQuery({
    queryKey: queryKeys.admin.events,
    queryFn: adminApi.listEvents,
  });

  const adminEvents = eventsQuery.data?.data ?? [];

  const appliedFilters = useMemo(() => {
    const filters: Array<{ label: string; value: string }> = [];
    if (form.actor_user_id.trim()) filters.push({ label: "Администратор", value: form.actor_user_id.trim() });
    if (form.event_id.trim()) filters.push({ label: "Мероприятие", value: form.event_id.trim() });
    if (form.action.trim()) filters.push({ label: "Действие", value: getActionLabel(form.action.trim()) });
    if (form.entity_type.trim()) filters.push({ label: "Сущность", value: getEntityTypeLabel(form.entity_type.trim()) });
    if (form.from) filters.push({ label: "Начало", value: form.from.replace("T", " ") });
    if (form.to) filters.push({ label: "Окончание", value: form.to.replace("T", " ") });
    if (page.trim() && page !== "1") filters.push({ label: "Страница", value: page.trim() });
    return filters;
  }, [form, page]);

  const exportWindowLabel = useMemo(() => {
    if (form.from && form.to) return `${form.from.replace("T", " ")} - ${form.to.replace("T", " ")}`;
    if (form.from) return `С ${form.from.replace("T", " ")}`;
    if (form.to) return `До ${form.to.replace("T", " ")}`;
    return "Весь период";
  }, [form.from, form.to]);

  const updateField = (field: keyof AuditExportForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setLastExport(null);
    setPreviewRows([]);
    setPreviewError(null);
    setFieldErrors((current) => {
      if (!current[field] && !(field === "from" || field === "to") && !current.range) return current;
      const next = { ...current };
      delete next[field];
      if (field === "from" || field === "to") delete next.range;
      return next;
    });
  };

  const updateLimit = (value: string) => {
    updateField("limit", value);
    setPage("1");
    setPageError(null);
  };

  const updatePage = (value: string) => {
    setPage(value);
    setLastExport(null);
    setPreviewRows([]);
    setPreviewError(null);
    setPageError(null);
  };

  const getQueryForm = (): AuditExportForm | null => {
    const pageNumber = Number(page.trim());
    const limitNumber = Number(form.limit.trim() || "1000");
    if (!/^\d+$/.test(page.trim()) || !Number.isSafeInteger(pageNumber) || pageNumber <= 0) {
      setPageError("Введите номер страницы больше 0");
      return null;
    }

    const offset = Number.isSafeInteger(limitNumber) && limitNumber > 0 ? (pageNumber - 1) * limitNumber : 0;
    return { ...form, offset: String(offset) };
  };

  const applyQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date(end);
    if (days === 0) {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - days);
    }

    setForm((current) => ({
      ...current,
      from: toDateTimeLocalValue(start),
      to: toDateTimeLocalValue(end),
    }));
    setError(null);
    setLastExport(null);
    setPreviewRows([]);
    setPreviewError(null);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.from;
      delete next.to;
      delete next.range;
      return next;
    });
  };

  const applyPreset = (preset: (typeof presetFilters)[number]) => {
    if (preset.days !== undefined) {
      applyQuickRange(preset.days);
    }
    setForm((current) => ({ ...current, ...preset.values }));
    setPage("1");
    setError(null);
    setPreviewError(null);
    setPreviewRows([]);
    setLastExport(null);
  };

  const resetForm = () => {
    setForm(initialForm);
    setPage("1");
    setError(null);
    setPreviewError(null);
    setFieldErrors({});
    setPageError(null);
    setLastExport(null);
    setPreviewRows([]);
  };

  const buildValidatedQuery = (limitOverride?: number) => {
    setError(null);
    setPreviewError(null);
    setFieldErrors({});
    setPageError(null);

    const queryForm = getQueryForm();
    if (!queryForm) return null;
    const result = buildAuditExportQuery(limitOverride ? { ...queryForm, limit: String(limitOverride) } : queryForm);
    if (!result.ok) {
      setFieldErrors(result.errors);
      return null;
    }

    return result.query;
  };

  const handlePreview = async () => {
    setIsPreviewLoading(true);
    setPreviewRows([]);

    try {
      const query = buildValidatedQuery(10);
      if (!query) return;

      const csv = await adminApi.exportAuditLogsCsv(query);
      setPreviewRows(parsePreviewRows(csv));
    } catch (downloadError) {
      setPreviewError(downloadError);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsExporting(true);
    setLastExport(null);

    try {
      const query = buildValidatedQuery();
      if (!query) {
        return;
      }

      const csv = await adminApi.exportAuditLogsCsv(query);
      const rowCount = countCsvDataRows(csv);
      downloadCsv(csv, getExportFilename(page));
      setLastExport({ at: new Date(), rowCount });
    } catch (downloadError) {
      setError(downloadError);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <RequireAuth allowedRoles={["admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-10 lg:pb-14">
        <Container>
          <div className="py-5 lg:py-8">
            <Button href={routes.adminEvents} variant="ghost" className="mb-4 min-h-10 gap-2 px-3">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Админ-панель
            </Button>

            <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] lg:p-7">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-yellow)] px-3 py-1 text-[13px] font-medium leading-[18px] text-[var(--color-brand-ink)]">
                    <FileClock className="h-4 w-4" aria-hidden />
                    Административный аудит
                  </span>
                  <h1 className="mt-4 text-[30px] font-bold leading-9 text-[var(--color-brand-ink)] lg:text-[36px] lg:leading-10">
                    Экспорт журнала аудита
                  </h1>
                  <p className="mt-3 max-w-3xl text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                    Файл выгружается по текущим фильтрам. Время указывается в вашем часовом поясе.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[360px]">
                  <SummaryTile label="Фильтры" value={String(appliedFilters.length)} />
                  <SummaryTile label="Строки" value={form.limit.trim() || "1000"} />
                  <SummaryTile label="Страница" value={page.trim() || "1"} />
                </div>
              </div>

              {appliedFilters.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {appliedFilters.map((filter) => (
                    <span
                      key={`${filter.label}-${filter.value}`}
                      className="max-w-full rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[12px] leading-5 text-[var(--color-brand-graphite)]"
                    >
                      <span className="font-medium text-[var(--color-brand-ink)]">{filter.label}:</span>{" "}
                      <span className="break-all">{filter.value}</span>
                    </span>
                  ))}
                </div>
              )}
            </section>

            <form onSubmit={handleSubmit} className="mt-5 rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 p-5 lg:p-6">
                  <section>
                    <h2 className="mb-3 text-[18px] font-semibold leading-6 text-[var(--color-brand-ink)]">Быстрые сценарии</h2>
                    <div className="flex flex-wrap gap-2">
                      {presetFilters.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="inline-flex min-h-9 items-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-3 text-[13px] leading-5 text-[var(--color-brand-graphite)] outline-none transition hover:bg-[#e7e9ee] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <FieldGroup title="Основные фильтры">
                    <Select
                      label="Мероприятие"
                      value={form.event_id}
                      onChange={(event) => updateField("event_id", event.target.value)}
                      disabled={eventsQuery.isLoading}
                      error={fieldErrors.event_id}
                    >
                      <option value="">Все мероприятия</option>
                      {adminEvents.map((event) => (
                        <option key={event.event_id} value={event.event_id}>
                          {event.title}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Действие"
                      value={form.action}
                      onChange={(event) => updateField("action", event.target.value)}
                    >
                      <option value="">Все действия</option>
                      {actionOptions.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Что изменяли"
                      value={form.entity_type}
                      onChange={(event) => updateField("entity_type", event.target.value)}
                    >
                      <option value="">Все типы записей</option>
                      {entityTypeOptions.map((entityType) => (
                        <option key={entityType.value} value={entityType.value}>
                          {entityType.label}
                        </option>
                      ))}
                    </Select>
                  </FieldGroup>

                  <details className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-4">
                    <summary className="cursor-pointer text-[14px] font-medium leading-5 text-[var(--color-brand-ink)]">
                      Дополнительные фильтры
                    </summary>
                    <div className="mt-4 max-w-sm">
                      <Input
                        label="ID администратора"
                        type="number"
                        min={1}
                        step={1}
                        value={form.actor_user_id}
                        onChange={(event) => updateField("actor_user_id", event.target.value)}
                        placeholder="Если известен точный ID"
                        error={fieldErrors.actor_user_id}
                      />
                    </div>
                  </details>

                  <FieldGroup title="Период" className="mt-6 border-t border-[var(--color-brand-line)] pt-6">
                    <div className="md:col-span-2 xl:col-span-4">
                      <div className="flex flex-wrap gap-2">
                        {quickRanges.map((range) => (
                          <button
                            key={range.label}
                            type="button"
                            onClick={() => applyQuickRange(range.days)}
                            className="inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-3 text-[13px] leading-5 text-[var(--color-brand-graphite)] outline-none transition hover:bg-[#e7e9ee] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                          >
                            <CalendarDays className="h-4 w-4" aria-hidden />
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      label="Начало периода"
                      type="datetime-local"
                      value={form.from}
                      onChange={(event) => updateField("from", event.target.value)}
                      error={fieldErrors.from}
                    />
                    <Input
                      label="Конец периода"
                      type="datetime-local"
                      value={form.to}
                      onChange={(event) => updateField("to", event.target.value)}
                      error={fieldErrors.to}
                    />
                  </FieldGroup>

                  <FieldGroup title="Объём файла" className="mt-6 border-t border-[var(--color-brand-line)] pt-6">
                    <Input
                      label="Сколько строк выгрузить"
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      value={form.limit}
                      onChange={(event) => updateLimit(event.target.value)}
                      error={fieldErrors.limit}
                    />
                    <Input
                      label="Страница выгрузки"
                      placeholder="1"
                      type="number"
                      min={1}
                      step={1}
                      value={page}
                      onChange={(event) => updatePage(event.target.value)}
                      error={pageError ?? undefined}
                    />
                  </FieldGroup>

                  <p className="mt-3 text-[13px] leading-5 text-[var(--color-brand-muted)]">
                    За один файл можно выгрузить до 1000 строк. Если записей больше, скачайте следующую страницу.
                  </p>
                </div>

                <aside className="border-t border-[var(--color-brand-line)] bg-[var(--color-brand-panel)] p-5 lg:border-l lg:border-t-0 lg:p-6">
                  <h2 className="text-[18px] font-semibold leading-6 text-[var(--color-brand-ink)]">Параметры экспорта</h2>
                  <dl className="mt-4 space-y-4 text-[14px] leading-5">
                    <SummaryRow label="Период" value={exportWindowLabel} />
                    <SummaryRow label="Строк в файле" value={`до ${form.limit.trim() || "1000"}`} />
                    <SummaryRow label="Страница" value={page.trim() || "1"} />
                    <SummaryRow label="Часовой пояс" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
                  </dl>

                  {fieldErrors.range && <ErrorMessage className="mt-5" message={fieldErrors.range} />}

                  {Boolean(error) && (
                    <ErrorMessage
                      className="mt-5"
                      message={getErrorMessage(error, "Не удалось экспортировать журнал аудита")}
                    />
                  )}

                  <LiveStatus className="mt-5 min-h-6 text-[13px] leading-5 text-[#237a3b]" busy={isExporting}>
                    {lastExport && (
                      <span className="inline-flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        <span>
                          Файл скачан: {formatExportTime(lastExportedAt)}. Строк: {lastExport.rowCount}.
                          {lastExport.rowCount >= Number(form.limit || 1000) ? " Возможно, есть следующая страница." : ""}
                        </span>
                      </span>
                    )}
                  </LiveStatus>

                  <div className="mt-5 grid gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full gap-2"
                      disabled={isPreviewLoading || isExporting}
                      onClick={() => {
                        void handlePreview();
                      }}
                    >
                      <FileClock className="h-4 w-4" aria-hidden />
                      {isPreviewLoading ? "Проверяем..." : "Показать первые строки"}
                    </Button>
                    <Button type="submit" className="w-full gap-2" disabled={isExporting}>
                      <Download className="h-4 w-4" aria-hidden />
                      {isExporting ? "Экспортируем..." : "Скачать файл"}
                    </Button>
                    <Button type="button" variant="secondary" className="w-full gap-2" onClick={resetForm}>
                      <RotateCcw className="h-4 w-4" aria-hidden />
                      Сбросить
                    </Button>
                  </div>
                </aside>
              </div>
            </form>

            <section className="mt-5 rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] lg:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[20px] font-semibold leading-7 text-[var(--color-brand-ink)]">Предпросмотр</h2>
                  <p className="mt-1 text-[14px] leading-5 text-[var(--color-brand-muted)]">
                    Первые 10 строк по выбранным фильтрам.
                  </p>
                </div>
              </div>

              {Boolean(previewError) && (
                <ErrorMessage className="mt-4" message={getErrorMessage(previewError, "Не удалось загрузить предпросмотр")} />
              )}

              {previewRows.length === 0 && !previewError ? (
                <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-4 py-3 text-[14px] leading-5 text-[var(--color-brand-graphite)]">
                  Нажмите “Показать первые строки”, чтобы проверить выгрузку перед скачиванием.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-[13px] leading-5">
                    <thead className="text-[12px] uppercase text-[var(--color-brand-muted)]">
                      <tr>
                        <th className="whitespace-nowrap px-3 py-2 font-medium">Время</th>
                        <th className="whitespace-nowrap px-3 py-2 font-medium">Администратор</th>
                        <th className="whitespace-nowrap px-3 py-2 font-medium">Действие</th>
                        <th className="whitespace-nowrap px-3 py-2 font-medium">Запись</th>
                        <th className="whitespace-nowrap px-3 py-2 font-medium">Мероприятие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-brand-line)]">
                      {previewRows.map((row) => (
                        <tr key={row.audit_log_id}>
                          <td className="whitespace-nowrap px-3 py-2 text-[var(--color-brand-graphite)]">
                            {row.created_at ? new Date(row.created_at).toLocaleString("ru-RU") : "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-[var(--color-brand-ink)]">
                            {row.actor_full_name || "-"}
                          </td>
                          <td className="px-3 py-2 text-[var(--color-brand-ink)]">{getActionLabel(row.action)}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-[var(--color-brand-graphite)]">
                            {getEntityTypeLabel(row.entity_type)}
                            {row.entity_id ? ` #${row.entity_id}` : ""}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-[var(--color-brand-graphite)]">
                            {row.event_id || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}

function FieldGroup({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="mb-4 text-[18px] font-semibold leading-6 text-[var(--color-brand-ink)]">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-3 py-2">
      <p className="text-[12px] leading-4 text-[var(--color-brand-muted)]">{label}</p>
      <p className="mt-1 truncate text-[20px] font-bold leading-6 text-[var(--color-brand-ink)]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-medium uppercase text-[var(--color-brand-muted)]">{label}</dt>
      <dd className="mt-1 break-words text-[var(--color-brand-ink)]">{value}</dd>
    </div>
  );
}
