import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import type { PublishReadinessIssueDTO } from "@/lib/api/types";
import { adminApi } from "./api";
import type { ConfirmDialogState } from "./ConfirmationDialog";
import { buildPublishChecklist } from "./eventPresentation";
import { getEffectivePublishIssues, getPublishValidationDetails, groupPublishIssuesBySection } from "./eventPublish";

type UseAdminEventPublicationParams = {
  eventId: number;
  isDraft: boolean;
  publishable: boolean;
  hasEventChanges: boolean;
  readinessIssues: PublishReadinessIssueDTO[];
  detailsReady: boolean;
  directionsReady: boolean;
  gamesReady: boolean;
  invalidateEvent: () => void;
  setLastSavedAt: (date: Date) => void;
  setConfirmDialog: (state: ConfirmDialogState) => void;
};

export function useAdminEventPublication({
  eventId,
  isDraft,
  publishable,
  hasEventChanges,
  readinessIssues,
  detailsReady,
  directionsReady,
  gamesReady,
  invalidateEvent,
  setLastSavedAt,
  setConfirmDialog,
}: UseAdminEventPublicationParams) {
  const publishMutation = useMutation({
    mutationFn: () => adminApi.publishEvent(eventId),
    onSuccess: () => {
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => adminApi.archiveEvent(eventId),
    onSuccess: () => {
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const validationDetails = getPublishValidationDetails(publishMutation.error);
  const publishIssues = useMemo(
    () => getEffectivePublishIssues(readinessIssues, validationDetails),
    [readinessIssues, validationDetails],
  );
  const publishIssuesBySection = useMemo(() => groupPublishIssuesBySection(publishIssues), [publishIssues]);
  const publishReady = isDraft && publishable && publishIssues.length === 0 && !hasEventChanges;
  const publishChecklist = useMemo(
    () =>
      buildPublishChecklist({
        detailsReady,
        directionsReady,
        gamesReady,
        publishIssuesBySection,
      }),
    [detailsReady, directionsReady, gamesReady, publishIssuesBySection],
  );

  const requestArchive = () => {
    setConfirmDialog({
      title: "Архивировать мероприятие",
      message: "Архивирование необратимо. Мероприятие останется в админском списке, но бизнес-операции будут недоступны.",
      confirmLabel: "Архивировать",
      tone: "danger",
      onConfirm: () => archiveMutation.mutate(),
    });
  };

  return {
    archiveMutation,
    publishChecklist,
    publishIssues,
    publishIssuesBySection,
    publishMutation,
    publishReady,
    publish: () => publishMutation.mutate(),
    requestArchive,
  };
}
