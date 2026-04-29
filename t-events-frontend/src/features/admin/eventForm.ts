import { z } from "zod";
import type { AdminEventPatchRequest } from "@/lib/api/types";
import { toComparableDateTime, toRfc3339 } from "./eventDateTime";

export type AdminEventForm = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  timezone: string;
  small_reward_percent: string;
  big_reward_percent: string;
};

export type AdminEventFormField = keyof AdminEventForm;
export type AdminEventFieldErrors = Partial<Record<AdminEventFormField, string>>;
type EventFormParseResult = { success: true } | { success: false; error: z.ZodError<AdminEventForm> };

export const emptyEventForm: AdminEventForm = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  timezone: "",
  small_reward_percent: "",
  big_reward_percent: "",
};

const eventFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string(),
  small_reward_percent: z.string(),
  big_reward_percent: z.string(),
});

const eventFieldLabels: Record<AdminEventFormField, string> = {
  title: "название",
  description: "описание",
  start_time: "время начала",
  end_time: "время окончания",
  timezone: "часовой пояс",
  small_reward_percent: "процент малого приза",
  big_reward_percent: "процент большого приза",
};

const scheduleFields: AdminEventFormField[] = ["start_time", "end_time", "timezone"];
const textFields: AdminEventFormField[] = [
  "title",
  "description",
  "timezone",
  "small_reward_percent",
  "big_reward_percent",
];

function normalizeFieldValue(field: AdminEventFormField, value: string): string {
  return textFields.includes(field) ? value.trim() : value;
}

export function getChangedEventFields(current: AdminEventForm, loaded: AdminEventForm): AdminEventFormField[] {
  return (Object.keys(eventFieldLabels) as AdminEventFormField[]).filter(
    (field) => normalizeFieldValue(field, current[field]) !== normalizeFieldValue(field, loaded[field]),
  );
}

export function getChangedEventFieldLabels(current: AdminEventForm, loaded: AdminEventForm): string[] {
  return getChangedEventFields(current, loaded).map((field) => eventFieldLabels[field]);
}

export function hasEventFormChanges(current: AdminEventForm, loaded: AdminEventForm): boolean {
  return getChangedEventFields(current, loaded).length > 0;
}

export function hasScheduleChanges(current: AdminEventForm, loaded: AdminEventForm): boolean {
  return scheduleFields.some(
    (field) => normalizeFieldValue(field, current[field]) !== normalizeFieldValue(field, loaded[field]),
  );
}

export function hasFieldErrors(errors: AdminEventFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function toPatchPayload(form: AdminEventForm, loaded: AdminEventForm): AdminEventPatchRequest {
  const full = toPatchComparable(form);
  const base = toPatchComparable(loaded);
  return Object.fromEntries(
    Object.entries(full).filter(([key, value]) => value !== base[key as keyof AdminEventPatchRequest]),
  ) as AdminEventPatchRequest;
}

export function toSchedulePayload(form: AdminEventForm) {
  return {
    start_time: toRfc3339(form.start_time, form.timezone),
    end_time: toRfc3339(form.end_time, form.timezone),
    timezone: form.timezone.trim(),
  };
}

export function validatePatchFormFields(form: AdminEventForm): AdminEventFieldErrors {
  return toFieldErrors(createPatchFormSchema().safeParse(form));
}

export function validateScheduleFormFields(form: AdminEventForm): AdminEventFieldErrors {
  return toFieldErrors(createScheduleFormSchema().safeParse(form));
}

function createPatchFormSchema() {
  return eventFormSchema.superRefine((form, context) => {
    if (!form.title.trim()) {
      addIssue(context, "title", "Название не может быть пустым.");
    }
    if ((form.start_time || form.end_time) && !form.timezone.trim()) {
      addIssue(context, "timezone", "Часовой пояс нужен для расписания.");
    }

    addRewardPercentIssues(form, context);
    addScheduleOrderIssue(form, context, false);
  });
}

function createScheduleFormSchema() {
  return eventFormSchema.superRefine((form, context) => {
    if (!form.start_time) {
      addIssue(context, "start_time", "Время начала обязательно.");
    }
    if (!form.end_time) {
      addIssue(context, "end_time", "Время окончания обязательно.");
    }
    if (!form.timezone.trim()) {
      addIssue(context, "timezone", "Часовой пояс обязателен.");
    }

    addScheduleOrderIssue(form, context, true);
  });
}

function addRewardPercentIssues(form: AdminEventForm, context: z.RefinementCtx) {
  const small = toOptionalNumber(form.small_reward_percent, "Порог малого приза");
  const big = toOptionalNumber(form.big_reward_percent, "Порог большого приза");

  const isSmallValid = small !== undefined && Number.isFinite(small) && small >= 1 && small <= 100;
  const isBigValid = big !== undefined && Number.isFinite(big) && big >= 1 && big <= 100;

  if (small !== undefined && !isSmallValid) {
    addIssue(context, "small_reward_percent", "Порог малого приза должен быть от 1 до 100.");
  }
  if (big !== undefined && !isBigValid) {
    addIssue(context, "big_reward_percent", "Порог большого приза должен быть от 1 до 100.");
  }
  if (isSmallValid && isBigValid && small >= big) {
    addIssue(context, "big_reward_percent", "Порог большого приза должен быть больше порога малого приза.");
  }
}

function addScheduleOrderIssue(form: AdminEventForm, context: z.RefinementCtx, requireSchedule: boolean) {
  if ((!requireSchedule && (!form.start_time || !form.end_time)) || (requireSchedule && (!form.start_time || !form.end_time))) {
    return;
  }
  if (!form.timezone.trim()) return;

  try {
    if (new Date(toRfc3339(form.start_time, form.timezone)) >= new Date(toRfc3339(form.end_time, form.timezone))) {
      addIssue(context, "end_time", "Время окончания должно быть позже времени начала.");
    }
  } catch {
    addIssue(context, "end_time", "Проверьте время начала и окончания.");
  }
}

function toFieldErrors(result: EventFormParseResult): AdminEventFieldErrors {
  if (result.success) return {};

  return result.error.issues.reduce<AdminEventFieldErrors>((errors, issue) => {
    const field = issue.path[0];
    if (isEventFormField(field) && errors[field] === undefined) {
      errors[field] = issue.message;
    }
    return errors;
  }, {});
}

function addIssue(context: z.RefinementCtx, path: AdminEventFormField, message: string) {
  context.addIssue({
    code: "custom",
    path: [path],
    message,
  });
}

function isEventFormField(value: unknown): value is AdminEventFormField {
  return typeof value === "string" && value in emptyEventForm;
}

function parseRequiredNumber(value: string, label: string): number {
  if (value.trim() === "") {
    throw new Error(`${label} обязательно.`);
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${label} должно быть числом.`);
  }
  return number;
}

function toOptionalNumber(value: string, label: string): number | undefined {
  return value.trim() === "" ? undefined : parseRequiredNumber(value, label);
}

function toPatchComparable(form: AdminEventForm): AdminEventPatchRequest {
  const patch: AdminEventPatchRequest = {
    title: form.title.trim(),
    description: form.description.trim(),
  };
  const startTime = toComparableDateTime(form.start_time, form.timezone);
  const endTime = toComparableDateTime(form.end_time, form.timezone);
  const timezone = form.timezone.trim();
  const smallRewardPercent = toOptionalNumber(form.small_reward_percent, "Порог малого приза");
  const bigRewardPercent = toOptionalNumber(form.big_reward_percent, "Порог большого приза");

  if (startTime !== undefined) patch.start_time = startTime;
  if (endTime !== undefined) patch.end_time = endTime;
  if (timezone) patch.timezone = timezone;
  if (smallRewardPercent !== undefined) patch.small_reward_percent = smallRewardPercent;
  if (bigRewardPercent !== undefined) patch.big_reward_percent = bigRewardPercent;

  return patch;
}
