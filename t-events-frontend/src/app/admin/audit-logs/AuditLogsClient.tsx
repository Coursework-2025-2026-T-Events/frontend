"use client";

import { FormEvent, useMemo } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FormErrorSummary from "@/components/ui/FormErrorSummary";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  auditActionOptions,
  auditEntityTypeOptions,
  auditPresetFilters,
  auditQuickRanges,
} from "@/features/admin/auditPresentation";
import {
  AuditExportAside,
  AuditExportHero,
  AuditPreviewSection,
  FieldGroup,
  toAuditErrorSummaryItems,
} from "@/features/admin/AuditLogsViews";
import { useAuditLogsExport } from "@/features/admin/useAuditLogsExport";
import RequireAuth from "@/features/auth/RequireAuth";
import { routes } from "@/lib/routes";

export default function AuditLogsClient() {
  const auditExport = useAuditLogsExport();
  const errorSummaryItems = useMemo(
    () => toAuditErrorSummaryItems(auditExport.fieldErrors, auditExport.pageError),
    [auditExport.fieldErrors, auditExport.pageError],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await auditExport.exportCsv();
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

            <AuditExportHero
              appliedFilters={auditExport.appliedFilters}
              limit={auditExport.form.limit}
              page={auditExport.page}
            />

            <form onSubmit={handleSubmit} className="mt-5 rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 p-5 lg:p-6">
                  <FormErrorSummary items={errorSummaryItems} className="mb-5" />

                  <section>
                    <h2 className="mb-3 text-[18px] font-semibold leading-6 text-[var(--color-brand-ink)]">Быстрые сценарии</h2>
                    <div className="flex flex-wrap gap-2">
                      {auditPresetFilters.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => auditExport.applyPreset(preset)}
                          className="inline-flex min-h-9 items-center rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-3 text-[13px] leading-5 text-[var(--color-brand-graphite)] outline-none transition hover:bg-[#e7e9ee] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <FieldGroup title="Основные фильтры">
                    <Select
                      id="audit-event-id"
                      label="Мероприятие"
                      value={auditExport.form.event_id}
                      onChange={(event) => auditExport.updateField("event_id", event.target.value)}
                      disabled={auditExport.eventsQuery.isLoading}
                      error={auditExport.fieldErrors.event_id}
                    >
                      <option value="">Все мероприятия</option>
                      {auditExport.adminEvents.map((event) => (
                        <option key={event.event_id} value={event.event_id}>
                          {event.title}
                        </option>
                      ))}
                    </Select>
                    <Select
                      id="audit-action"
                      label="Действие"
                      value={auditExport.form.action}
                      onChange={(event) => auditExport.updateField("action", event.target.value)}
                    >
                      <option value="">Все действия</option>
                      {auditActionOptions.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </Select>
                    <Select
                      id="audit-entity-type"
                      label="Что изменяли"
                      value={auditExport.form.entity_type}
                      onChange={(event) => auditExport.updateField("entity_type", event.target.value)}
                    >
                      <option value="">Все типы записей</option>
                      {auditEntityTypeOptions.map((entityType) => (
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
                        id="audit-actor-user-id"
                        label="ID администратора"
                        type="number"
                        min={1}
                        step={1}
                        value={auditExport.form.actor_user_id}
                        onChange={(event) => auditExport.updateField("actor_user_id", event.target.value)}
                        placeholder="Если известен точный ID"
                        error={auditExport.fieldErrors.actor_user_id}
                      />
                    </div>
                  </details>

                  <FieldGroup title="Период" className="mt-6 border-t border-[var(--color-brand-line)] pt-6">
                    <div className="md:col-span-2 xl:col-span-4">
                      <div className="flex flex-wrap gap-2">
                        {auditQuickRanges.map((range) => (
                          <button
                            key={range.label}
                            type="button"
                            onClick={() => auditExport.applyQuickRange(range.days)}
                            className="inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-3 text-[13px] leading-5 text-[var(--color-brand-graphite)] outline-none transition hover:bg-[#e7e9ee] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
                          >
                            <CalendarDays className="h-4 w-4" aria-hidden />
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      id="audit-from"
                      label="Начало периода"
                      type="datetime-local"
                      value={auditExport.form.from}
                      onChange={(event) => auditExport.updateField("from", event.target.value)}
                      error={auditExport.fieldErrors.from}
                    />
                    <Input
                      id="audit-to"
                      label="Конец периода"
                      type="datetime-local"
                      value={auditExport.form.to}
                      onChange={(event) => auditExport.updateField("to", event.target.value)}
                      error={auditExport.fieldErrors.to}
                    />
                  </FieldGroup>

                  <FieldGroup title="Объём файла" className="mt-6 border-t border-[var(--color-brand-line)] pt-6">
                    <Input
                      id="audit-limit"
                      label="Сколько строк выгрузить"
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      value={auditExport.form.limit}
                      onChange={(event) => auditExport.updateLimit(event.target.value)}
                      error={auditExport.fieldErrors.limit}
                    />
                    <Input
                      id="audit-page"
                      label="Страница выгрузки"
                      placeholder="1"
                      type="number"
                      min={1}
                      step={1}
                      value={auditExport.page}
                      onChange={(event) => auditExport.updatePage(event.target.value)}
                      error={auditExport.pageError ?? undefined}
                    />
                  </FieldGroup>

                  <p className="mt-3 text-[13px] leading-5 text-[var(--color-brand-muted)]">
                    За один файл можно выгрузить до 1000 строк. Если записей больше, скачайте следующую страницу.
                  </p>
                </div>

                <AuditExportAside
                  error={auditExport.error}
                  exportWindowLabel={auditExport.exportWindowLabel}
                  fieldErrors={auditExport.fieldErrors}
                  form={auditExport.form}
                  isExporting={auditExport.isExporting}
                  isPreviewLoading={auditExport.isPreviewLoading}
                  lastExport={auditExport.lastExport}
                  lastExportedAt={auditExport.lastExportedAt}
                  onPreview={() => {
                    void auditExport.handlePreview();
                  }}
                  onReset={auditExport.resetForm}
                  page={auditExport.page}
                />
              </div>
            </form>

            <AuditPreviewSection previewError={auditExport.previewError} previewRows={auditExport.previewRows} />
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}

