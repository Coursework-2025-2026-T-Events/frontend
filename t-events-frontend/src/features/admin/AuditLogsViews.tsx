import { CheckCircle2, Download, FileClock, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/ui/ErrorMessage";
import type { FormErrorSummaryItem } from "@/components/ui/FormErrorSummary";
import LiveStatus from "@/components/ui/LiveStatus";
import type { AuditPreviewRow } from "@/features/admin/auditCsv";
import type { AuditExportFieldErrors, AuditExportForm } from "@/features/admin/auditLogExport";
import {
  formatAuditExportTime,
  getAuditActionLabel,
  getAuditEntityTypeLabel,
} from "@/features/admin/auditPresentation";
import { getErrorMessage } from "@/lib/getErrorMessage";

export const auditFieldSummary: Record<keyof AuditExportForm | "range" | "page", { label: string; fieldId?: string | undefined }> = {
  actor_user_id: { label: "ID администратора", fieldId: "audit-actor-user-id" },
  event_id: { label: "Мероприятие", fieldId: "audit-event-id" },
  action: { label: "Действие", fieldId: "audit-action" },
  entity_type: { label: "Что изменяли", fieldId: "audit-entity-type" },
  from: { label: "Начало периода", fieldId: "audit-from" },
  to: { label: "Конец периода", fieldId: "audit-to" },
  limit: { label: "Сколько строк выгрузить", fieldId: "audit-limit" },
  offset: { label: "Смещение выгрузки" },
  range: { label: "Период", fieldId: "audit-from" },
  page: { label: "Страница выгрузки", fieldId: "audit-page" },
};

export function toAuditErrorSummaryItems(
  fieldErrors: AuditExportFieldErrors,
  pageError: string | null,
): FormErrorSummaryItem[] {
  const fieldItems = (Object.entries(fieldErrors) as Array<[keyof AuditExportFieldErrors, string | undefined]>)
    .filter((entry): entry is [keyof AuditExportFieldErrors, string] => Boolean(entry[1]))
    .map(([field, message]) => ({
      ...auditFieldSummary[field],
      message,
    }));

  if (!pageError) return fieldItems;

  return [
    ...fieldItems,
    {
      ...auditFieldSummary.page,
      message: pageError,
    },
  ];
}

export function AuditExportHero({
  appliedFilters,
  limit,
  page,
}: {
  appliedFilters: Array<{ label: string; value: string }>;
  limit: string;
  page: string;
}) {
  return (
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
          <SummaryTile label="Строки" value={limit.trim() || "1000"} />
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
  );
}

export function AuditExportAside({
  error,
  exportWindowLabel,
  fieldErrors,
  form,
  isExporting,
  isPreviewLoading,
  lastExport,
  lastExportedAt,
  onPreview,
  onReset,
  page,
}: {
  error: unknown;
  exportWindowLabel: string;
  fieldErrors: AuditExportFieldErrors;
  form: AuditExportForm;
  isExporting: boolean;
  isPreviewLoading: boolean;
  lastExport: { at: Date; rowCount: number } | null;
  lastExportedAt: Date | null;
  onPreview: () => void;
  onReset: () => void;
  page: string;
}) {
  return (
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
        <ErrorMessage className="mt-5" message={getErrorMessage(error, "Не удалось экспортировать журнал аудита")} />
      )}

      <LiveStatus className="mt-5 min-h-6 text-[13px] leading-5 text-[#237a3b]" busy={isExporting}>
        {lastExport && (
          <span className="inline-flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            <span>
              Файл скачан: {formatAuditExportTime(lastExportedAt)}. Строк: {lastExport.rowCount}.
              {lastExport.rowCount >= Number(form.limit || 1000) ? " Возможно, есть следующая страница." : ""}
            </span>
          </span>
        )}
      </LiveStatus>

      <div className="mt-5 grid gap-3">
        <Button type="button" variant="secondary" className="w-full gap-2" disabled={isPreviewLoading || isExporting} onClick={onPreview}>
          <FileClock className="h-4 w-4" aria-hidden />
          {isPreviewLoading ? "Проверяем..." : "Показать первые строки"}
        </Button>
        <Button type="submit" className="w-full gap-2" disabled={isExporting}>
          <Download className="h-4 w-4" aria-hidden />
          {isExporting ? "Экспортируем..." : "Скачать файл"}
        </Button>
        <Button type="button" variant="secondary" className="w-full gap-2" onClick={onReset}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Сбросить
        </Button>
      </div>
    </aside>
  );
}

export function AuditPreviewSection({
  previewError,
  previewRows,
}: {
  previewError: unknown;
  previewRows: AuditPreviewRow[];
}) {
  return (
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
                  <td className="px-3 py-2 text-[var(--color-brand-ink)]">{getAuditActionLabel(row.action)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[var(--color-brand-graphite)]">
                    {getAuditEntityTypeLabel(row.entity_type)}
                    {row.entity_id ? ` #${row.entity_id}` : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[var(--color-brand-graphite)]">{row.event_id || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function FieldGroup({
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
