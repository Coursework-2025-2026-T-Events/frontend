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

function parseInteger(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^\d+$/.test(trimmed)) return Number.NaN;
  return Number(trimmed);
}

function parseRequiredPositiveInteger(
  value: string,
  field: keyof AuditExportForm,
  errors: AuditExportFieldErrors
): number | undefined {
  const parsed = parseInteger(value);
  if (parsed === undefined) return undefined;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    errors[field] = "Введите целое число больше 0";
    return undefined;
  }
  return parsed;
}

function parseNonNegativeInteger(
  value: string,
  field: keyof AuditExportForm,
  errors: AuditExportFieldErrors
): number | undefined {
  const parsed = parseInteger(value);
  if (parsed === undefined) return undefined;
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    errors[field] = "Введите целое число от 0";
    return undefined;
  }
  return parsed;
}

function parseDateTime(value: string, field: keyof AuditExportForm, errors: AuditExportFieldErrors): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors[field] = "Введите корректную дату и время";
    return undefined;
  }
  return date;
}

export function buildAuditExportQuery(form: AuditExportForm): AuditExportQueryResult {
  const errors: AuditExportFieldErrors = {};
  const query: AuditLogExportQuery = {};

  const actorUserId = parseRequiredPositiveInteger(form.actor_user_id, "actor_user_id", errors);
  const eventId = parseRequiredPositiveInteger(form.event_id, "event_id", errors);
  const limit = parseRequiredPositiveInteger(form.limit, "limit", errors);
  const offset = parseNonNegativeInteger(form.offset, "offset", errors);
  const from = parseDateTime(form.from, "from", errors);
  const to = parseDateTime(form.to, "to", errors);

  if (from && to && from.getTime() > to.getTime()) {
    errors.range = "Дата начала не должна быть позже даты окончания";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const action = form.action.trim();
  const entityType = form.entity_type.trim();

  if (actorUserId !== undefined) query.actor_user_id = actorUserId;
  if (eventId !== undefined) query.event_id = eventId;
  if (action) query.action = action;
  if (entityType) query.entity_type = entityType;
  if (from) query.from = from.toISOString();
  if (to) query.to = to.toISOString();
  if (limit !== undefined) query.limit = Math.min(limit, MAX_EXPORT_LIMIT);
  if (offset !== undefined) query.offset = offset;

  return { ok: true, query };
}
