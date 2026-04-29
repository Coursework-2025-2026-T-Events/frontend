import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "@/features/admin/api";
import type { ConfirmDialogState } from "@/features/admin/ConfirmationDialog";
import { toLocalDateTimeValueInZone } from "@/features/admin/eventDateTime";
import { emptyEventForm } from "@/features/admin/eventForm";
import {
  getDetailsActionLabel,
  getEventLifecycleSummary,
  getSaveStatusText,
  getStatusTone,
} from "@/features/admin/eventPresentation";
import { groupPublishIssuesBySection } from "@/features/admin/eventPublish";
import { buildEventSettingsTabs, getNextEventSettingsTab } from "@/features/admin/eventSettingsTabs";
import { groupGamesByDirection } from "@/features/admin/games";
import type { AdminEventSettingsTab } from "@/features/admin/SettingsTabButton";
import { useAdminEventDetails } from "@/features/admin/useAdminEventDetails";
import { useAdminEventDirections } from "@/features/admin/useAdminEventDirections";
import { useAdminEventGames } from "@/features/admin/useAdminEventGames";
import { useAdminEventPublication } from "@/features/admin/useAdminEventPublication";
import type { GameEngine } from "@/lib/api/types";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";

export type EventSettingsTab = AdminEventSettingsTab;

export function useAdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const queryClient = useQueryClient();

  const [templateEngine, setTemplateEngine] = useState<GameEngine | "all">("all");
  const [clientError, setClientError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<EventSettingsTab>("details");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const eventQuery = useQuery({
    queryKey: queryKeys.admin.eventSettings(eventId),
    queryFn: () => adminApi.getEventSettings(eventId),
    enabled: Number.isFinite(eventId),
  });

  const templatesQuery = useQuery({
    queryKey: queryKeys.admin.gameTemplates(templateEngine),
    queryFn: () => adminApi.listGameTemplates(templateEngine === "all" ? undefined : templateEngine),
  });

  const loadedEventForm = useMemo(() => {
    const event = eventQuery.data?.data.event;
    if (!event) return emptyEventForm;
    const dateDisplayTimezone = event.timezone ?? "Europe/Moscow";
    return {
      title: event.title,
      description: event.description,
      start_time: toLocalDateTimeValueInZone(event.start_time, dateDisplayTimezone),
      end_time: toLocalDateTimeValueInZone(event.end_time, dateDisplayTimezone),
      timezone: event.timezone ?? "",
      small_reward_percent: event.small_reward_percent === null ? "" : String(event.small_reward_percent),
      big_reward_percent: event.big_reward_percent === null ? "" : String(event.big_reward_percent),
    };
  }, [eventQuery.data]);

  const eventStatus = eventQuery.data?.data.event.status;
  const isDraft = eventStatus === "draft";
  const isArchived = eventStatus === "archived";

  const invalidateEvent = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.eventSettings(eventId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.events });
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.directions });
  };

  const adminEventGames = useAdminEventGames({
    eventId,
    templateEngine,
    templates: templatesQuery.data?.data ?? [],
    invalidateEvent,
    setClientError,
    setTemplateEngine,
    setLastSavedAt,
    setConfirmDialog,
  });

  const settings = eventQuery.data?.data;
  const event = settings?.event;
  const eventDirections = settings?.directions ?? [];
  const eventGames = settings?.games ?? [];
  const readiness = settings?.readiness;

  const adminEventDirections = useAdminEventDirections({
    eventId,
    eventDirections,
    setClientError,
    setLastSavedAt,
  });

  const adminEventDetails = useAdminEventDetails({
    eventId,
    loadedEventForm,
    eventStatus,
    invalidateEvent,
    setClientError,
    setLastSavedAt,
  });

  const readinessIssues = useMemo(() => readiness?.issues ?? [], [readiness]);
  const issuesBySection = useMemo(() => groupPublishIssuesBySection(readinessIssues), [readinessIssues]);
  const status = getStatusTone(event?.status);
  const directionCount = eventDirections.length || event?.direction_count || 0;
  const gameCount = eventGames.length || event?.game_count || 0;
  const hasSchedule = readiness?.schedule ?? Boolean(event?.start_time && event?.end_time);
  const hasRewards =
    readiness?.rewards ?? (typeof event?.small_reward_percent === "number" && typeof event?.big_reward_percent === "number");
  const isEventLoaded = Boolean(event);
  const detailsReady = isEventLoaded && hasSchedule && hasRewards && issuesBySection.details.length === 0;
  const directionsReady = isEventLoaded && directionCount > 0 && issuesBySection.directions.length === 0;
  const gamesReady = isEventLoaded && gameCount > 0 && issuesBySection.games.length === 0;

  const adminEventPublication = useAdminEventPublication({
    eventId,
    isDraft,
    publishable: Boolean(readiness?.publishable),
    hasEventChanges: adminEventDetails.hasChanges,
    readinessIssues,
    detailsReady,
    directionsReady,
    gamesReady,
    invalidateEvent,
    setLastSavedAt,
    setConfirmDialog,
  });

  const eventError = adminEventDetails.eventError ?? adminEventPublication.publishMutation.error;
  const { gamesByDirection, gamesWithoutDirection } = groupGamesByDirection(eventDirections, eventGames);
  const eventLifecycleSummary = getEventLifecycleSummary(eventStatus);
  const primaryDetailsActionLabel = getDetailsActionLabel(eventStatus);
  const saveStatusText = getSaveStatusText(adminEventDetails.hasChanges, lastSavedAt);
  const tabs = buildEventSettingsTabs({
    isDraft,
    isEventLoaded,
    detailsReady,
    directionsReady,
    gamesReady,
    directionCount,
    gameCount,
    publishIssueCount: adminEventPublication.publishIssues.length,
  });

  const selectTab = (tab: EventSettingsTab) => {
    setActiveTab(tab);
  };

  const handleEventSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    adminEventDetails.submit();
  };

  const handleAddDirection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    adminEventDirections.addDirection();
  };

  const handleRemoveDirection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    adminEventDirections.removeDirection();
  };

  const handleBackToEvents = () => {
    if (!adminEventDetails.hasChanges) {
      router.push(routes.adminEvents);
      return;
    }
    setConfirmDialog({
      title: "Покинуть страницу",
      message: "Несохраненные изменения в основных настройках будут потеряны.",
      confirmLabel: "Покинуть",
      tone: "danger",
      onConfirm: () => router.push(routes.adminEvents),
    });
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tabId: EventSettingsTab) => {
    const nextTab = getNextEventSettingsTab(tabs, tabId, event.key);
    if (!nextTab) return;
    event.preventDefault();
    setActiveTab(nextTab);
  };

  const handleConfirmDialogCancel = () => setConfirmDialog(null);

  const handleConfirmDialogConfirm = () => {
    const action = confirmDialog?.onConfirm;
    setConfirmDialog(null);
    action?.();
  };

  return {
    activeTab,
    adminEventDetails,
    adminEventDirections,
    adminEventGames,
    adminEventPublication,
    clientError,
    confirmDialog,
    event,
    eventDirections,
    eventError,
    eventGames,
    eventLifecycleSummary,
    eventQuery,
    gamesByDirection,
    gamesWithoutDirection,
    handleAddDirection,
    handleBackToEvents,
    handleConfirmDialogCancel,
    handleConfirmDialogConfirm,
    handleEventSubmit,
    handleRemoveDirection,
    handleTabKeyDown,
    isArchived,
    isDraft,
    primaryDetailsActionLabel,
    saveStatusText,
    selectTab,
    status,
    tabs,
    templates: templatesQuery.data?.data ?? [],
    templatesQuery,
  };
}
