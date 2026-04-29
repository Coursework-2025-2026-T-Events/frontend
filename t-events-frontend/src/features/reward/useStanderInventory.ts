import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "@/features/events/api";
import { rewardApi } from "@/features/reward/api";
import { queryKeys } from "@/lib/queryKeys";
import {
  getInventoryEventId,
  getInventoryRewardCounts,
  getInventoryVisibleRange,
  hasNextInventoryPage,
  hasPreviousInventoryPage,
  initialStanderInventoryFilters,
  STANDER_INVENTORY_PAGE_LIMIT,
  toInventoryRequestFilters,
  validateStanderInventoryFilters,
  type StanderInventoryFieldErrors,
  type StanderInventoryFilters,
} from "./standerInventory";

export function useStanderInventory(isAuthorized: boolean) {
  const [draftFilters, setDraftFilters] = useState<StanderInventoryFilters>(initialStanderInventoryFilters);
  const [appliedFilters, setAppliedFilters] = useState<StanderInventoryFilters>(initialStanderInventoryFilters);
  const [fieldErrors, setFieldErrors] = useState<StanderInventoryFieldErrors>({});
  const [offset, setOffset] = useState(0);

  const eventId = getInventoryEventId(appliedFilters);
  const draftEventId = getInventoryEventId(draftFilters);
  const hasEventId = eventId !== null;
  const hasDraftEventId = draftEventId !== null;

  const eventsQuery = useQuery({
    queryKey: queryKeys.events.inventoryFilterOptions,
    queryFn: eventsApi.list,
    enabled: isAuthorized,
  });

  const directionsQuery = useQuery({
    queryKey: queryKeys.events.inventoryDirectionFilterOptions(draftEventId ?? 0),
    queryFn: () => eventsApi.directions(draftEventId ?? 0),
    enabled: isAuthorized && hasDraftEventId,
  });

  const redemptionsQuery = useQuery({
    queryKey: queryKeys.reward.standerRedemptions(appliedFilters, offset),
    queryFn: () =>
      rewardApi.listEventRedemptions(eventId ?? 0, {
        ...toInventoryRequestFilters(appliedFilters),
        limit: STANDER_INVENTORY_PAGE_LIMIT,
        offset,
      }),
    enabled: hasEventId,
  });

  const page = redemptionsQuery.data?.data;

  const updateDraftFilter = (
    field: keyof StanderInventoryFilters,
    value: StanderInventoryFilters[keyof StanderInventoryFilters],
  ) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === "eventId" ? { directionId: "" } : null),
    }));
    setFieldErrors((current) => {
      if (!current[field] && !(field === "eventId" && current.directionId)) return current;

      const next = { ...current };
      delete next[field];
      if (field === "eventId") delete next.directionId;
      return next;
    });
  };

  const applyFilters = () => {
    const validationErrors = validateStanderInventoryFilters(draftFilters);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return false;

    setOffset(0);
    setAppliedFilters(draftFilters);
    return true;
  };

  const resetFilters = () => {
    setDraftFilters(initialStanderInventoryFilters);
    setAppliedFilters(initialStanderInventoryFilters);
    setFieldErrors({});
    setOffset(0);
  };

  const goToPreviousPage = () => {
    setOffset((current) => Math.max(0, current - STANDER_INVENTORY_PAGE_LIMIT));
  };

  const goToNextPage = () => {
    setOffset((current) => current + STANDER_INVENTORY_PAGE_LIMIT);
  };

  return {
    draftFilters,
    fieldErrors,
    eventsQuery,
    directionsQuery,
    redemptionsQuery,
    page,
    selectedEvent: getSelectedInventoryEvent(eventsQuery.data?.data, eventId),
    hasEventId,
    hasDraftEventId,
    hasPreviousPage: hasPreviousInventoryPage(offset),
    hasNextPage: hasNextInventoryPage(page),
    visibleRange: getInventoryVisibleRange(page),
    rewardsCount: getInventoryRewardCounts(page?.items ?? []),
    updateDraftFilter,
    applyFilters,
    resetFilters,
    goToPreviousPage,
    goToNextPage,
  };
}

function getSelectedInventoryEvent(events: { event_id: number; title: string }[] | undefined, eventId: number | null) {
  if (eventId === null) return undefined;
  return events?.find((event) => event.event_id === eventId);
}
