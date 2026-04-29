import { z } from "zod";
import type { RedemptionListEntryDTO, RedemptionListPageDTO, RewardType } from "@/lib/api/types";

export const STANDER_INVENTORY_PAGE_LIMIT = 20;

export type StanderInventoryFilters = {
  eventId: string;
  q: string;
  directionId: string;
  rewardType: RewardType | "";
};

export type StanderInventoryFieldErrors = Partial<Record<keyof StanderInventoryFilters, string>>;

export const initialStanderInventoryFilters: StanderInventoryFilters = {
  eventId: "",
  q: "",
  directionId: "",
  rewardType: "",
};

const rewardTypeSchema = z.union([z.literal(""), z.literal("small"), z.literal("big")]);

const inventoryFiltersSchema = z.object({
  eventId: z.string(),
  q: z.string(),
  directionId: z.string(),
  rewardType: rewardTypeSchema,
});

export function getInventoryRewardTypeLabel(type: RewardType): string {
  return type === "big" ? "Большой" : "Малый";
}

export function formatInventoryDateTime(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInventoryRewardCounts(items: RedemptionListEntryDTO[]) {
  return {
    big: items.filter((item) => item.reward_type === "big").length,
    small: items.filter((item) => item.reward_type === "small").length,
  };
}

export function getInventoryVisibleRange(page: RedemptionListPageDTO | undefined) {
  if (!page || page.total === 0) {
    return { from: 0, to: 0, total: page?.total ?? 0 };
  }

  return {
    from: page.offset + 1,
    to: Math.min(page.offset + page.limit, page.total),
    total: page.total,
  };
}

export function hasPreviousInventoryPage(offset: number) {
  return offset > 0;
}

export function hasNextInventoryPage(page: RedemptionListPageDTO | undefined) {
  if (!page) return false;
  return page.offset + page.limit < page.total;
}

export function validateStanderInventoryFilters(filters: StanderInventoryFilters): StanderInventoryFieldErrors {
  const result = inventoryFiltersSchema.safeParse(filters);
  if (!result.success) {
    return result.error.issues.reduce<StanderInventoryFieldErrors>((errors, issue) => {
      const field = issue.path[0];
      if (isInventoryFilterField(field)) errors[field] = "Проверьте значение поля";
      return errors;
    }, {});
  }

  const errors: StanderInventoryFieldErrors = {};
  if (getInventoryEventId(filters) === null) {
    errors.eventId = "Выберите мероприятие";
  }
  if (filters.directionId.trim() && getInventoryDirectionId(filters) === undefined) {
    errors.directionId = "Выберите корректное направление";
  }

  return errors;
}

export function getInventoryEventId(filters: StanderInventoryFilters) {
  const eventId = parsePositiveInteger(filters.eventId);
  return eventId ?? null;
}

export function getInventoryDirectionId(filters: StanderInventoryFilters) {
  return parsePositiveInteger(filters.directionId);
}

export function toInventoryRequestFilters(filters: StanderInventoryFilters) {
  const parsed = inventoryFiltersSchema.parse(filters);

  return {
    q: parsed.q.trim() || undefined,
    direction_id: getInventoryDirectionId(parsed),
    reward_type: parsed.rewardType || undefined,
  };
}

function parsePositiveInteger(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const result = z.coerce.number().int().safe().positive().safeParse(trimmed);
  return result.success ? result.data : undefined;
}

function isInventoryFilterField(value: unknown): value is keyof StanderInventoryFilters {
  return typeof value === "string" && value in initialStanderInventoryFilters;
}
