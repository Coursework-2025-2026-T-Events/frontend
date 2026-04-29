import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import { countCsvDataRows, downloadCsv, parsePreviewRows, type AuditPreviewRow } from "@/features/admin/auditCsv";
import { buildAuditExportQuery, type AuditExportFieldErrors, type AuditExportForm } from "@/features/admin/auditLogExport";
import { getAuditActionLabel, getAuditEntityTypeLabel, getAuditExportFilename } from "@/features/admin/auditPresentation";
import { queryKeys } from "@/lib/queryKeys";

export const initialAuditExportForm: AuditExportForm = {
  actor_user_id: "",
  event_id: "",
  action: "",
  entity_type: "",
  from: "",
  to: "",
  limit: "1000",
  offset: "0",
};

export function useAuditLogsExport() {
  const [form, setForm] = useState(initialAuditExportForm);
  const [page, setPage] = useState("1");
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [previewError, setPreviewError] = useState<unknown>(null);
  const [fieldErrors, setFieldErrors] = useState<AuditExportFieldErrors>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{ at: Date; rowCount: number } | null>(null);
  const [previewRows, setPreviewRows] = useState<AuditPreviewRow[]>([]);

  const eventsQuery = useQuery({
    queryKey: queryKeys.admin.events,
    queryFn: adminApi.listEvents,
  });

  const appliedFilters = useMemo(() => {
    const filters: Array<{ label: string; value: string }> = [];
    if (form.actor_user_id.trim()) filters.push({ label: "Администратор", value: form.actor_user_id.trim() });
    if (form.event_id.trim()) filters.push({ label: "Мероприятие", value: form.event_id.trim() });
    if (form.action.trim()) filters.push({ label: "Действие", value: getAuditActionLabel(form.action.trim()) });
    if (form.entity_type.trim()) filters.push({ label: "Сущность", value: getAuditEntityTypeLabel(form.entity_type.trim()) });
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
    clearExportResult();
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
    clearExportResult();
    setPageError(null);
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
    clearExportResult();
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.from;
      delete next.to;
      delete next.range;
      return next;
    });
  };

  const applyPreset = (preset: { values: Partial<AuditExportForm>; days?: number | undefined }) => {
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
    setForm(initialAuditExportForm);
    setPage("1");
    setError(null);
    setPreviewError(null);
    setFieldErrors({});
    setPageError(null);
    setLastExport(null);
    setPreviewRows([]);
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

  const exportCsv = async () => {
    setIsExporting(true);
    setLastExport(null);

    try {
      const query = buildValidatedQuery();
      if (!query) return;

      const csv = await adminApi.exportAuditLogsCsv(query);
      const rowCount = countCsvDataRows(csv);
      downloadCsv(csv, getAuditExportFilename(page));
      setLastExport({ at: new Date(), rowCount });
    } catch (downloadError) {
      setError(downloadError);
    } finally {
      setIsExporting(false);
    }
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

  function clearExportResult() {
    setLastExport(null);
    setPreviewRows([]);
    setPreviewError(null);
  }

  return {
    form,
    page,
    isExporting,
    isPreviewLoading,
    error,
    previewError,
    fieldErrors,
    pageError,
    lastExport,
    lastExportedAt: lastExport?.at ?? null,
    previewRows,
    eventsQuery,
    adminEvents: eventsQuery.data?.data ?? [],
    appliedFilters,
    exportWindowLabel,
    updateField,
    updateLimit,
    updatePage,
    applyQuickRange,
    applyPreset,
    resetForm,
    handlePreview,
    exportCsv,
  };
}

function toDateTimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
