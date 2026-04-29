import { z } from "zod";
import type { AuditLogExportQuery } from "@/lib/api/types";

export type AuditExportForm = {
  actor_user_id: string;
  event_id: string;
  action: string;
  entity_type: string;
  from: string;
  to: string;
  limit: string;
  offset: string;
};

export type AuditExportFieldErrors = Partial<Record<keyof AuditExportForm | "range", string>>;

export type AuditExportQueryResult =
  | { ok: true; query: AuditLogExportQuery }
  | { ok: false; errors: AuditExportFieldErrors };

const MAX_EXPORT_LIMIT = 1000;

const auditExportFormSchema = z.object({
  actor_user_id: z.string(),
  event_id: z.string(),
  action: z.string(),
  entity_type: z.string(),
  from: z.string(),
  to: z.string(),
  limit: z.string(),
  offset: z.string(),
});

type ParsedAuditExportForm = {
  actor_user_id?: number;
  event_id?: number;
  action?: string;
  entity_type?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
};

export function buildAuditExportQuery(form: AuditExportForm): AuditExportQueryResult {
  const validation = parseAuditExportForm(form);
  if (!validation.ok) return validation;

  const parsed = validation.parsed;
  const query: AuditLogExportQuery = {};

  if (parsed.actor_user_id !== undefined) query.actor_user_id = parsed.actor_user_id;
  if (parsed.event_id !== undefined) query.event_id = parsed.event_id;
  if (parsed.action !== undefined) query.action = parsed.action;
  if (parsed.entity_type !== undefined) query.entity_type = parsed.entity_type;
  if (parsed.from !== undefined) query.from = parsed.from.toISOString();
  if (parsed.to !== undefined) query.to = parsed.to.toISOString();
  if (parsed.limit !== undefined) query.limit = Math.min(parsed.limit, MAX_EXPORT_LIMIT);
  if (parsed.offset !== undefined) query.offset = parsed.offset;

  return { ok: true, query };
}

function parseAuditExportForm(
  form: AuditExportForm,
): { ok: true; parsed: ParsedAuditExportForm } | { ok: false; errors: AuditExportFieldErrors } {
  const normalized = auditExportFormSchema.parse(form);
  const errors: AuditExportFieldErrors = {};

  const parsed: ParsedAuditExportForm = {};
  const actorUserId = parseOptionalInteger(normalized.actor_user_id, "actor_user_id", "positive", errors);
  const eventId = parseOptionalInteger(normalized.event_id, "event_id", "positive", errors);
  const limit = parseOptionalInteger(normalized.limit, "limit", "positive", errors);
  const offset = parseOptionalInteger(normalized.offset, "offset", "nonNegative", errors);
  const from = parseOptionalDateTime(normalized.from, "from", errors);
  const to = parseOptionalDateTime(normalized.to, "to", errors);

  if (from !== undefined && to !== undefined && from.getTime() > to.getTime()) {
    errors.range = "Дата начала не должна быть позже даты окончания";
  }

  const action = normalized.action.trim();
  const entityType = normalized.entity_type.trim();

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  if (actorUserId !== undefined) parsed.actor_user_id = actorUserId;
  if (eventId !== undefined) parsed.event_id = eventId;
  if (action) parsed.action = action;
  if (entityType) parsed.entity_type = entityType;
  if (from !== undefined) parsed.from = from;
  if (to !== undefined) parsed.to = to;
  if (limit !== undefined) parsed.limit = limit;
  if (offset !== undefined) parsed.offset = offset;

  return { ok: true, parsed };
}

function parseOptionalInteger(
  value: string,
  field: keyof AuditExportForm,
  mode: "positive" | "nonNegative",
  errors: AuditExportFieldErrors,
): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const result = z.coerce.number().int().safe().safeParse(trimmed);
  if (!result.success || (mode === "positive" ? result.data <= 0 : result.data < 0)) {
    errors[field] = mode === "positive" ? "Введите целое число больше 0" : "Введите целое число от 0";
    return undefined;
  }

  return result.data;
}

function parseOptionalDateTime(
  value: string,
  field: keyof AuditExportForm,
  errors: AuditExportFieldErrors,
): Date | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors[field] = "Введите корректную дату и время";
    return undefined;
  }

  return date;
}
