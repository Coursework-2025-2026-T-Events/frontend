import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/features/admin/api";
import {
  getChangedEventFieldLabels,
  hasEventFormChanges,
  hasFieldErrors,
  hasScheduleChanges,
  toPatchPayload,
  toSchedulePayload,
  validatePatchFormFields,
  type AdminEventFieldErrors,
  type AdminEventForm,
  type AdminEventFormField,
} from "@/features/admin/eventForm";
import { validateScheduleFormFields } from "./eventForm";

type UseAdminEventDetailsParams = {
  eventId: number;
  loadedEventForm: AdminEventForm;
  eventStatus?: string | undefined;
  invalidateEvent: () => void;
  setClientError: (message: string | null) => void;
  setLastSavedAt: (value: Date) => void;
};

export function useAdminEventDetails({
  eventId,
  loadedEventForm,
  eventStatus,
  invalidateEvent,
  setClientError,
  setLastSavedAt,
}: UseAdminEventDetailsParams) {
  const [eventForm, setEventForm] = useState<AdminEventForm | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AdminEventFieldErrors>({});

  const currentEventForm = eventForm ?? loadedEventForm;
  const isDraft = eventStatus === "draft";
  const isPublished = eventStatus === "published";

  const changedFieldLabels = useMemo(
    () => getChangedEventFieldLabels(currentEventForm, loadedEventForm),
    [currentEventForm, loadedEventForm],
  );
  const hasChanges = useMemo(
    () => hasEventFormChanges(currentEventForm, loadedEventForm),
    [currentEventForm, loadedEventForm],
  );
  const hasScheduleChangesOnly = useMemo(
    () => hasScheduleChanges(currentEventForm, loadedEventForm),
    [currentEventForm, loadedEventForm],
  );

  const patchMutation = useMutation({
    mutationFn: () => adminApi.updateEvent(eventId, toPatchPayload(currentEventForm, loadedEventForm)),
    onSuccess: () => {
      resetForm();
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: () => adminApi.updateSchedule(eventId, toSchedulePayload(currentEventForm)),
    onSuccess: () => {
      resetForm();
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const submit = () => {
    if (isPublished) {
      updateSchedule();
      return;
    }
    if (!isDraft) {
      setClientError("Изменения недоступны в текущем статусе мероприятия.");
      return;
    }
    updateDetails();
  };

  const updateDetails = () => {
    const validationErrors = validatePatchFormFields(currentEventForm);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      setClientError(null);
      return;
    }
    if (Object.keys(toPatchPayload(currentEventForm, loadedEventForm)).length === 0) {
      setClientError("Нет измененных полей мероприятия.");
      return;
    }

    setClientError(null);
    patchMutation.mutate();
  };

  const updateSchedule = () => {
    if (!hasScheduleChangesOnly) {
      setClientError("Расписание не изменено.");
      return;
    }

    const validationErrors = validateScheduleFormFields(currentEventForm);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      setClientError(null);
      return;
    }

    setClientError(null);
    scheduleMutation.mutate();
  };

  const updateField = (field: AdminEventFormField, value: string) => {
    setEventForm({ ...currentEventForm, [field]: value });
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
  };

  function resetForm() {
    setEventForm(null);
    setFieldErrors({});
  }

  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  return {
    currentEventForm,
    fieldErrors,
    changedFieldLabels,
    hasChanges,
    hasScheduleChanges: hasScheduleChangesOnly,
    patchMutation,
    scheduleMutation,
    eventError: patchMutation.error ?? scheduleMutation.error,
    isSaving: patchMutation.isPending || scheduleMutation.isPending,
    canSave: isPublished ? hasScheduleChangesOnly : isDraft && hasChanges,
    canEditDraftFields: isDraft,
    canEditScheduleFields: isDraft || isPublished,
    canEditRewardFields: isDraft,
    updateField,
    resetForm,
    submit,
  };
}
