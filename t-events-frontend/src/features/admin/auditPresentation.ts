import type { AuditAction, AuditEntityType } from "@/lib/api/types";
import type { AuditExportForm } from "./auditLogExport";

export const auditActionOptions: Array<{ value: AuditAction; label: string }> = [
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

export const auditEntityTypeOptions: Array<{ value: AuditEntityType; label: string }> = [
  { value: "event", label: "Мероприятие" },
  { value: "direction", label: "Направление" },
  { value: "event_game", label: "Игра мероприятия" },
  { value: "reward_redemption", label: "Выдача награды" },
];

export const auditQuickRanges = [
  { label: "Сегодня", days: 0 },
  { label: "7 дней", days: 7 },
  { label: "30 дней", days: 30 },
];

export const auditPresetFilters: Array<{ label: string; values: Partial<AuditExportForm>; days?: number }> = [
  { label: "Публикации", values: { action: "admin.event.publish", entity_type: "event" }, days: 30 },
  { label: "Выдачи наград", values: { action: "reward.redemption.create", entity_type: "reward_redemption" }, days: 7 },
  { label: "Изменения игр", values: { entity_type: "event_game" }, days: 30 },
];

export function getAuditActionLabel(value: string): string {
  return auditActionOptions.find((option) => option.value === value)?.label ?? value;
}

export function getAuditEntityTypeLabel(value: string): string {
  return auditEntityTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function formatAuditExportTime(value: Date | null): string {
  if (!value) return "";
  return value.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getAuditExportFilename(page: string, now = new Date()): string {
  const today = now.toISOString().slice(0, 10);
  return `audit-journal-${today}-page-${page || "1"}.csv`;
}
