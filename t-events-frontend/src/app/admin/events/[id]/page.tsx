"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Input from "@/components/ui/Input";
import LoadingState from "@/components/ui/LoadingState";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Typography from "@/components/ui/Typography";
import { adminApi } from "@/features/admin/api";
import ArchivePanel from "@/features/admin/ArchivePanel";
import ConfigInputs from "@/features/admin/ConfigInputs";
import { getChangedEventFieldLabels, hasEventFormChanges, hasScheduleChanges } from "@/features/admin/eventForm";
import { defaultConfigForm } from "@/features/admin/gameConfig";
import { difficulties, difficultyLabels, engineLabels, publishFieldLabels, statusLabels } from "@/features/admin/labels";
import RequireAuth from "@/features/auth/RequireAuth";
import { ApiError } from "@/lib/api/client";
import type {
  AdminEventGameDTO,
  AdminEventPatchRequest,
  EventGameConfigDTO,
  GameEngine,
  PublishReadinessIssueDTO,
  PublishValidationErrorDTO,
  TemplateQuestionStatsDTO,
} from "@/lib/api/types";
import { getErrorMessage, localizeErrorText } from "@/lib/getErrorMessage";
import { routes } from "@/lib/routes";

const emptyEventForm = {
  title: "",
  description: "",
  start_time: "",
  end_time: "",
  timezone: "",
  small_reward_percent: "",
  big_reward_percent: "",
};

const timezoneOptions = [
  { value: "Europe/Moscow", label: "Москва" },
  { value: "Europe/Kaliningrad", label: "Калининград" },
  { value: "Europe/Samara", label: "Самара" },
  { value: "Asia/Yekaterinburg", label: "Екатеринбург" },
  { value: "Asia/Omsk", label: "Омск" },
  { value: "Asia/Krasnoyarsk", label: "Красноярск" },
  { value: "Asia/Irkutsk", label: "Иркутск" },
  { value: "Asia/Yakutsk", label: "Якутск" },
  { value: "Asia/Vladivostok", label: "Владивосток" },
  { value: "Asia/Kamchatka", label: "Камчатка" },
  { value: "UTC", label: "UTC" },
];

type EventFormField = keyof typeof emptyEventForm;
type EventFieldErrors = Partial<Record<EventFormField, string>>;
type EventSettingsTab = "details" | "directions" | "games" | "publish";
type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};
type ConfirmDialogState =
  | {
      title: string;
      message: string;
      confirmLabel: string;
      tone?: "danger" | "primary";
      onConfirm: () => void;
    }
  | null;

function hasFieldErrors(errors: EventFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

function toLocalDateTimeValueInZone(value: string | null, timezone: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDateTimeInZone(date, timezone);
}

function formatDateTimeInZone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    hour12: false,
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour = value("hour") === "24" ? "00" : value("hour");
  return `${value("day")}.${value("month")}.${value("year")} ${hour}:${value("minute")}`;
}

function getTimezoneOffsetMinutes(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    hour12: false,
  }).formatToParts(date);
  const numeric = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const localAsUtc = Date.UTC(
    numeric("year"),
    numeric("month") - 1,
    numeric("day"),
    numeric("hour"),
    numeric("minute"),
    numeric("second")
  );
  return Math.round((localAsUtc - date.getTime()) / 60_000);
}

function formatOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "Z";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function parseLocalDateTime(value: string): LocalDateTimeParts | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const russianMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})[ T](\d{2}):(\d{2})$/);
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  const parts = russianMatch
    ? {
        day: Number(russianMatch[1]),
        month: Number(russianMatch[2]),
        year: Number(russianMatch[3]),
        hour: Number(russianMatch[4]),
        minute: Number(russianMatch[5]),
      }
    : isoMatch
      ? {
          year: Number(isoMatch[1]),
          month: Number(isoMatch[2]),
          day: Number(isoMatch[3]),
          hour: Number(isoMatch[4]),
          minute: Number(isoMatch[5]),
        }
      : null;

  if (!parts) return null;
  const candidate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0));
  if (
    candidate.getUTCFullYear() !== parts.year ||
    candidate.getUTCMonth() !== parts.month - 1 ||
    candidate.getUTCDate() !== parts.day ||
    candidate.getUTCHours() !== parts.hour ||
    candidate.getUTCMinutes() !== parts.minute
  ) {
    return null;
  }
  return parts;
}

function formatLocalDateTimeValue(parts: LocalDateTimeParts): string {
  const year = String(parts.year).padStart(4, "0");
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  const hour = String(parts.hour).padStart(2, "0");
  const minute = String(parts.minute).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function toRfc3339(localValue: string, timezone: string): string {
  if (!localValue) return "";
  const parts = parseLocalDateTime(localValue);
  if (!parts) throw new Error("invalid local datetime");
  const initialUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0));
  const firstOffset = getTimezoneOffsetMinutes(initialUtc, timezone);
  const adjustedUtc = new Date(initialUtc.getTime() - firstOffset * 60_000);
  const finalOffset = getTimezoneOffsetMinutes(adjustedUtc, timezone);
  return `${formatLocalDateTimeValue(parts)}:00${formatOffset(finalOffset)}`;
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

function toComparableDateTime(value: string, timezone: string): string | undefined {
  if (!value) return undefined;
  const normalizedTimezone = timezone.trim();
  const parts = parseLocalDateTime(value);
  if (!parts) return value;
  return normalizedTimezone ? toRfc3339(value, normalizedTimezone) : formatLocalDateTimeValue(parts);
}

function toOptionalNumber(value: string, label: string): number | undefined {
  return value.trim() === "" ? undefined : parseRequiredNumber(value, label);
}

function toPatchComparable(form: typeof emptyEventForm): AdminEventPatchRequest {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    start_time: toComparableDateTime(form.start_time, form.timezone),
    end_time: toComparableDateTime(form.end_time, form.timezone),
    timezone: form.timezone.trim() || undefined,
    small_reward_percent: toOptionalNumber(form.small_reward_percent, "Порог малого приза"),
    big_reward_percent: toOptionalNumber(form.big_reward_percent, "Порог большого приза"),
  };
}

function toPatchPayload(form: typeof emptyEventForm, loaded: typeof emptyEventForm): AdminEventPatchRequest {
  const full = toPatchComparable(form);
  const base = toPatchComparable(loaded);
  return Object.fromEntries(
    Object.entries(full).filter(([key, value]) => value !== base[key as keyof AdminEventPatchRequest])
  ) as AdminEventPatchRequest;
}

function toSchedulePayload(form: typeof emptyEventForm) {
  return {
    start_time: toRfc3339(form.start_time, form.timezone),
    end_time: toRfc3339(form.end_time, form.timezone),
    timezone: form.timezone.trim(),
  };
}

function toConfig(form: typeof defaultConfigForm): EventGameConfigDTO {
  return {
    questions_to_pick: {
      easy: Number(form.easy_pick),
      medium: Number(form.medium_pick),
      hard: Number(form.hard_pick),
    },
    score_by_level: {
      easy: Number(form.easy_score),
      medium: Number(form.medium_score),
      hard: Number(form.hard_score),
    },
  };
}

function validateConfigForm(form: typeof defaultConfigForm, questionStats?: TemplateQuestionStatsDTO): string | null {
  try {
    for (const difficulty of difficulties) {
      const pickKey = `${difficulty}_pick` as keyof typeof defaultConfigForm;
      const scoreKey = `${difficulty}_score` as keyof typeof defaultConfigForm;
      const label = difficultyLabels[difficulty];
      const pick = parseRequiredNumber(form[pickKey], `Количество вопросов (${label})`);
      const score = parseRequiredNumber(form[scoreKey], `Баллы за уровень (${label})`);
      const available = questionStats?.[difficulty];
      if (pick < 0) return `Количество вопросов (${label}) не может быть отрицательным.`;
      if (score < 0) return `Баллы за уровень (${label}) не могут быть отрицательными.`;
      if (available !== undefined && pick > available) {
        return `В шаблоне доступно вопросов (${label}): ${available}. Уменьшите количество вопросов.`;
      }
      if (pick > 0 && score <= 0) return `Баллы за уровень (${label}) должны быть положительными, если выбраны вопросы.`;
    }
  } catch (error) {
    return error instanceof Error ? error.message : "Проверьте правила игры.";
  }
  return null;
}

function validatePatchFormFields(form: typeof emptyEventForm): EventFieldErrors {
  const errors: EventFieldErrors = {};
  if (!form.title.trim()) errors.title = "Название не может быть пустым.";
  if ((form.start_time || form.end_time) && !form.timezone.trim()) errors.timezone = "Часовой пояс нужен для расписания.";
  const small = form.small_reward_percent.trim() === "" ? undefined : Number(form.small_reward_percent);
  const big = form.big_reward_percent.trim() === "" ? undefined : Number(form.big_reward_percent);
  if (small !== undefined && (!Number.isFinite(small) || small < 1 || small > 100)) {
    errors.small_reward_percent = "Порог малого приза должен быть от 1 до 100.";
  }
  if (big !== undefined && (!Number.isFinite(big) || big < 1 || big > 100)) {
    errors.big_reward_percent = "Порог большого приза должен быть от 1 до 100.";
  }
  if (small !== undefined && big !== undefined && !errors.small_reward_percent && !errors.big_reward_percent && small >= big) {
    errors.big_reward_percent = "Порог большого приза должен быть больше порога малого приза.";
  }
  if (form.start_time && form.end_time && !errors.timezone) {
    try {
      if (new Date(toRfc3339(form.start_time, form.timezone)) >= new Date(toRfc3339(form.end_time, form.timezone))) {
        errors.end_time = "Время окончания должно быть позже времени начала.";
      }
    } catch {
      errors.end_time = "Проверьте время начала и окончания.";
    }
  }
  return errors;
}

function validateScheduleFormFields(form: typeof emptyEventForm): EventFieldErrors {
  const errors: EventFieldErrors = {};
  if (!form.start_time) errors.start_time = "Время начала обязательно.";
  if (!form.end_time) errors.end_time = "Время окончания обязательно.";
  if (!form.timezone.trim()) errors.timezone = "Часовой пояс обязателен.";
  try {
    if (!hasFieldErrors(errors) && new Date(toRfc3339(form.start_time, form.timezone)) >= new Date(toRfc3339(form.end_time, form.timezone))) {
      errors.end_time = "Время окончания должно быть позже времени начала.";
    }
  } catch {
    errors.end_time = "Проверьте время начала и окончания.";
  }
  return errors;
}

function configToForm(config: EventGameConfigDTO): typeof defaultConfigForm {
  return {
    easy_pick: String(config.questions_to_pick.easy),
    medium_pick: String(config.questions_to_pick.medium),
    hard_pick: String(config.questions_to_pick.hard),
    easy_score: String(config.score_by_level.easy),
    medium_score: String(config.score_by_level.medium),
    hard_score: String(config.score_by_level.hard),
  };
}

function publishDetails(error: unknown): PublishValidationErrorDTO[] {
  if (!(error instanceof ApiError)) return [];
  if (!Array.isArray(error.details)) return [];
  return error.details.filter(isPublishValidationError);
}

function isPublishValidationError(value: unknown): value is PublishValidationErrorDTO {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.code === "string" &&
    (item.field === undefined || typeof item.field === "string") &&
    typeof item.message === "string"
  );
}

const statusTone: Record<string, { label: string; className: string; dot: string }> = {
  draft: { label: "Черновик", className: "bg-[#f1f3f6] text-[var(--color-brand-graphite)]", dot: "bg-[#8a94a6]" },
  published: { label: "Опубликовано", className: "bg-[#eef5ff] text-[#126df7]", dot: "bg-[#126df7]" },
  active: { label: "Активно", className: "bg-[#eaf7ee] text-[#237a3b]", dot: "bg-[#35b55b]" },
  finished: { label: "Завершено", className: "bg-[#fff7cf] text-[var(--color-brand-ink)]", dot: "bg-[#d9a900]" },
  archived: { label: "Архив", className: "bg-[#fdecec] text-[#b42318]", dot: "bg-[#d04437]" },
};

function getStatusTone(status?: string) {
  return status ? statusTone[status] ?? { label: statusLabels[status] ?? status, className: "bg-[#f1f3f6] text-[var(--color-brand-graphite)]", dot: "bg-[#8a94a6]" } : null;
}

export default function AdminEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const queryClient = useQueryClient();

  const [eventForm, setEventForm] = useState<typeof emptyEventForm | null>(null);
  const [directionId, setDirectionId] = useState("");
  const [removeDirectionId, setRemoveDirectionId] = useState("");
  const [templateEngine, setTemplateEngine] = useState<GameEngine | "all">("all");
  const [attachDirectionId, setAttachDirectionId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [configForm, setConfigForm] = useState(defaultConfigForm);
  const [updateEventGameId, setUpdateEventGameId] = useState("");
  const [updateConfigForm, setUpdateConfigForm] = useState(defaultConfigForm);
  const [clientError, setClientError] = useState<string | null>(null);
  const [eventFieldErrors, setEventFieldErrors] = useState<EventFieldErrors>({});
  const [activeTab, setActiveTab] = useState<EventSettingsTab>("details");
  const [editingGame, setEditingGame] = useState<AdminEventGameDTO | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const eventQuery = useQuery({
    queryKey: ["admin", "event-settings", eventId],
    queryFn: () => adminApi.getEventSettings(eventId),
    enabled: Number.isFinite(eventId),
  });

  const templatesQuery = useQuery({
    queryKey: ["admin", "game-templates", templateEngine],
    queryFn: () => adminApi.listGameTemplates(templateEngine === "all" ? undefined : templateEngine),
  });

  const adminDirectionsQuery = useQuery({
    queryKey: ["admin", "directions"],
    queryFn: () => adminApi.listDirections({ limit: 100 }),
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

  const currentEventForm = eventForm ?? loadedEventForm;
  const changedEventFieldLabels = useMemo(
    () => getChangedEventFieldLabels(currentEventForm, loadedEventForm),
    [currentEventForm, loadedEventForm]
  );
  const hasEventChanges = useMemo(
    () => hasEventFormChanges(currentEventForm, loadedEventForm),
    [currentEventForm, loadedEventForm]
  );
  const hasEventScheduleChanges = useMemo(
    () => hasScheduleChanges(currentEventForm, loadedEventForm),
    [currentEventForm, loadedEventForm]
  );
  const eventStatus = eventQuery.data?.data.event.status;
  const isDraft = eventStatus === "draft";
  const isPublished = eventStatus === "published";
  const isActive = eventStatus === "active";
  const isFinished = eventStatus === "finished";
  const isArchived = eventStatus === "archived";

  const selectedTemplate = useMemo(
    () => templatesQuery.data?.data.find((template) => template.game_template_id === Number(selectedTemplateId)),
    [selectedTemplateId, templatesQuery.data]
  );

  const editingGameTemplate = useMemo(
    () => templatesQuery.data?.data.find((template) => template.game_template_id === editingGame?.game_template_id),
    [editingGame, templatesQuery.data]
  );

  const availableDirections = useMemo(() => {
    const attachedIds = new Set(eventQuery.data?.data.directions.map((direction) => direction.direction_id) ?? []);
    return adminDirectionsQuery.data?.data.filter((direction) => !attachedIds.has(direction.direction_id)) ?? [];
  }, [adminDirectionsQuery.data, eventQuery.data]);

  const applyTemplateDefaults = (templateId: string) => {
    const template = templatesQuery.data?.data.find((item) => item.game_template_id === Number(templateId));
    if (!template) return;
    setConfigForm(template.recommended_config ? configToForm(template.recommended_config) : {
      easy_pick: template.question_stats.easy > 0 ? "1" : "0",
      medium_pick: template.question_stats.medium > 0 ? "1" : "0",
      hard_pick: template.question_stats.hard > 0 ? "1" : "0",
      easy_score: "1",
      medium_score: "2",
      hard_score: "3",
    });
  };

  const invalidateEvent = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "event-settings", eventId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "directions"] });
  };

  const patchEventMutation = useMutation({
    mutationFn: () => adminApi.updateEvent(eventId, toPatchPayload(currentEventForm, loadedEventForm)),
    onSuccess: () => {
      setEventForm(null);
      setEventFieldErrors({});
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: () => adminApi.updateSchedule(eventId, toSchedulePayload(currentEventForm)),
    onSuccess: () => {
      setEventForm(null);
      setEventFieldErrors({});
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const addDirectionMutation = useMutation({
    mutationFn: () => adminApi.addDirection(eventId, Number(directionId)),
    onSuccess: () => {
      setDirectionId("");
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const removeDirectionMutation = useMutation({
    mutationFn: () => adminApi.removeDirection(eventId, Number(removeDirectionId)),
    onSuccess: () => {
      setRemoveDirectionId("");
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

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

  const attachMutation = useMutation({
    mutationFn: () =>
      adminApi.attachGame(eventId, Number(attachDirectionId), {
        game_template_id: Number(selectedTemplateId),
        config: toConfig(configForm),
      }),
    onSuccess: (res) => {
      setAttachDirectionId("");
      setSelectedTemplateId("");
      setConfigForm(defaultConfigForm);
      setUpdateEventGameId(String(res.data.event_game_id));
      setUpdateConfigForm(configToForm(res.data.config));
      setEditingGame(res.data);
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: () =>
      adminApi.updateEventGame(Number(updateEventGameId), {
        config: toConfig(updateConfigForm),
    }),
    onSuccess: (res) => {
      setEditingGame(res.data);
      setUpdateConfigForm(configToForm(res.data.config));
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: (eventGameId: number) => adminApi.deleteEventGame(eventGameId),
    onSuccess: (_, eventGameId) => {
      if (editingGame?.event_game_id === eventGameId) {
        setEditingGame(null);
        setUpdateEventGameId("");
      }
      setLastSavedAt(new Date());
      invalidateEvent();
    },
  });

  const handleEventSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPublished) {
      handleSchedule();
      return;
    }
    if (!isDraft) {
      setClientError("Изменения недоступны в текущем статусе мероприятия.");
      return;
    }
    handlePatchEvent();
  };

  const handlePatchEvent = () => {
    const validationErrors = validatePatchFormFields(currentEventForm);
    setEventFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      setClientError(null);
      return;
    }
    if (Object.keys(toPatchPayload(currentEventForm, loadedEventForm)).length === 0) {
      setClientError("Нет измененных полей мероприятия.");
      return;
    }
    setClientError(null);
    patchEventMutation.mutate();
  };

  const handleSchedule = () => {
    if (!hasEventScheduleChanges) {
      setClientError("Расписание не изменено.");
      return;
    }
    const validationErrors = validateScheduleFormFields(currentEventForm);
    setEventFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      setClientError(null);
      return;
    }
    setClientError(null);
    scheduleMutation.mutate();
  };

  const handleAddDirection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!directionId) {
      setClientError("Выберите направление из списка.");
      return;
    }
    setClientError(null);
    addDirectionMutation.mutate();
  };

  const handleRemoveDirection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    removeDirectionMutation.mutate();
  };

  const handleAttach = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateConfigForm(configForm, selectedTemplate?.question_stats);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);
    attachMutation.mutate();
  };

  const handleUpdateGame = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!updateEventGameId) {
      setClientError("Сначала добавьте игру или выберите игру для настройки.");
      return;
    }
    const validationError = validateConfigForm(updateConfigForm, editingGameTemplate?.question_stats);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);
    updateGameMutation.mutate();
  };

  const handleEditGame = (game: AdminEventGameDTO) => {
    setEditingGame(game);
    setUpdateEventGameId(String(game.event_game_id));
    setUpdateConfigForm(configToForm(game.config));
  };

  const handleDeleteGame = (game: AdminEventGameDTO) => {
    setConfirmDialog({
      title: "Удалить игру",
      message: `Игра "${game.title}" будет удалена из черновика мероприятия.`,
      confirmLabel: "Удалить",
      tone: "danger",
      onConfirm: () => deleteGameMutation.mutate(game.event_game_id),
    });
  };

  const handleArchive = () => {
    setConfirmDialog({
      title: "Архивировать мероприятие",
      message: "Архивирование необратимо. Мероприятие останется в админском списке, но бизнес-операции будут недоступны.",
      confirmLabel: "Архивировать",
      tone: "danger",
      onConfirm: () => archiveMutation.mutate(),
    });
  };

  const handleBackToEvents = () => {
    if (!hasEventChanges) {
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

  const eventError = patchEventMutation.error ?? scheduleMutation.error ?? publishMutation.error;
  const validationDetails = publishDetails(publishMutation.error);
  const settings = eventQuery.data?.data;
  const event = settings?.event;
  const eventDirections = settings?.directions ?? [];
  const eventGames = settings?.games ?? [];
  const readiness = settings?.readiness;
  const readinessIssues = useMemo(() => readiness?.issues ?? [], [readiness]);
  const issuesBySection = useMemo(
    () =>
      readinessIssues.reduce<Record<EventSettingsTab, PublishReadinessIssueDTO[]>>(
        (groups, issue) => {
          groups[issue.section].push(issue);
          return groups;
        },
        { details: [], directions: [], games: [], publish: [] }
      ),
    [readinessIssues]
  );
  const publishIssues = readinessIssues.length > 0 ? readinessIssues : validationDetails.map((detail): PublishReadinessIssueDTO => ({
    code: detail.code,
    message: detail.message,
    section: "publish",
    field: detail.field,
  }));
  const publishIssuesBySection = useMemo(
    () =>
      publishIssues.reduce<Record<EventSettingsTab, PublishReadinessIssueDTO[]>>(
        (groups, issue) => {
          groups[issue.section].push(issue);
          return groups;
        },
        { details: [], directions: [], games: [], publish: [] }
      ),
    [publishIssues]
  );
  const status = getStatusTone(event?.status);
  const directionCount = eventDirections.length || event?.direction_count || 0;
  const gameCount = eventGames.length || event?.game_count || 0;
  const hasSchedule = readiness?.schedule ?? Boolean(event?.start_time && event?.end_time);
  const hasRewards = readiness?.rewards ??
    (typeof event?.small_reward_percent === "number" && typeof event?.big_reward_percent === "number");
  const isEventLoaded = Boolean(event);
  const detailsReady = isEventLoaded && hasSchedule && hasRewards && issuesBySection.details.length === 0;
  const directionsReady = isEventLoaded && directionCount > 0 && issuesBySection.directions.length === 0;
  const gamesReady = isEventLoaded && gameCount > 0 && issuesBySection.games.length === 0;
  const publishReady = isDraft && Boolean(readiness?.publishable) && publishIssues.length === 0 && !hasEventChanges;
  const publishChecklist: Array<{ id: EventSettingsTab; label: string; fallback: string; ready: boolean; issues: PublishReadinessIssueDTO[] }> = [
    {
      id: "details",
      label: "Основное",
      fallback: "Проверьте описание, расписание и награды.",
      ready: detailsReady,
      issues: publishIssuesBySection.details,
    },
    {
      id: "directions",
      label: "Направления",
      fallback: "Добавьте направление участия.",
      ready: directionsReady,
      issues: publishIssuesBySection.directions,
    },
    {
      id: "games",
      label: "Игры",
      fallback: "Добавьте игры к направлениям.",
      ready: gamesReady,
      issues: publishIssuesBySection.games,
    },
    ...(publishIssuesBySection.publish.length > 0
      ? [
          {
            id: "publish" as EventSettingsTab,
            label: "Проверка",
            fallback: "Проверьте настройки публикации.",
            ready: false,
            issues: publishIssuesBySection.publish,
          },
        ]
      : []),
  ];
  const gamesByDirection = eventDirections.map((direction) => ({
    direction,
    games: eventGames.filter((game) => game.direction_id === direction.direction_id),
  }));
  const gamesWithoutDirection = eventGames.filter(
    (game) => !eventDirections.some((direction) => direction.direction_id === game.direction_id)
  );
  const eventLifecycleSummary = isDraft
    ? "Черновик можно редактировать и готовить к публикации."
    : isPublished
      ? "Мероприятие опубликовано, но еще не началось. До старта можно изменить расписание."
      : isActive
        ? "Мероприятие активно и доступно участникам."
        : isFinished
          ? "Мероприятие завершено по расписанию."
          : isArchived
            ? "Мероприятие находится в архиве. Бизнес-операции недоступны."
            : "Текущий статус мероприятия получен с сервера.";
  const primaryDetailsActionLabel = isPublished ? "Обновить расписание" : "Сохранить изменения";
  const isSavingDetails = patchEventMutation.isPending || scheduleMutation.isPending;
  const canSaveDetails = isPublished ? hasEventScheduleChanges : isDraft && hasEventChanges;
  const canEditDraftFields = isDraft;
  const canEditScheduleFields = isDraft || isPublished;
  const canEditRewardFields = isDraft;
  const saveStatusText = hasEventChanges
    ? "Есть несохраненные изменения. Проверка публикации обновится после сохранения."
    : lastSavedAt
      ? `Сохранено ${lastSavedAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
      : "Изменения сохраняются вручную.";
  const tabs: Array<{ id: EventSettingsTab; label: string; hint: string; badge?: string | number; hasIssue?: boolean }> = [
    {
      id: "details",
      label: "Основное",
      hint: isDraft ? "Описание, время и призы" : "Расписание и призы",
      hasIssue: isEventLoaded && !detailsReady,
    },
    {
      id: "directions",
      label: "Направления",
      hint: "Маршруты участия",
      badge: isEventLoaded ? directionCount : undefined,
      hasIssue: isEventLoaded && !directionsReady,
    },
    {
      id: "games",
      label: "Игры",
      hint: "Правила и баллы",
      badge: isEventLoaded ? gameCount : undefined,
      hasIssue: isEventLoaded && !gamesReady,
    },
    {
      id: "publish",
      label: "Публикация",
      hint: isDraft ? "Запуск и архив" : "Статус и архив",
      hasIssue: isDraft && publishIssues.length > 0,
    },
  ];

  const updateEventField = (field: EventFormField, value: string) => {
    setEventForm({ ...currentEventForm, [field]: value });
    setEventFieldErrors((errors) => ({ ...errors, [field]: undefined }));
  };

  const selectTab = (tab: EventSettingsTab) => {
    setActiveTab(tab);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, tabId: EventSettingsTab) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const tabIds = tabs.map((tab) => tab.id);
    const currentIndex = tabIds.indexOf(tabId);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabIds.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % tabIds.length
            : (currentIndex - 1 + tabIds.length) % tabIds.length;
    setActiveTab(tabIds[nextIndex]);
  };

  const renderEventGame = (game: AdminEventGameDTO) => (
    <div
      key={game.event_game_id}
      className={clsx(
        "rounded-[var(--radius-md)] border bg-white p-4",
        editingGame?.event_game_id === game.event_game_id
          ? "border-[var(--color-brand-ink)] shadow-[0_10px_28px_rgba(16,17,20,0.10)]"
          : "border-[var(--color-brand-line)]"
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Typography weight="bold">{game.title}</Typography>
          <Typography className="mt-1 text-neutral-600" size="sm">
            {game.direction_name} · {game.template_title} · {engineLabels[game.engine]}
          </Typography>
          <Typography className="mt-1 text-neutral-600" size="sm">
            Максимум: {game.max_score}. Шагов: {game.steps_total}.
          </Typography>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={!isDraft} onClick={() => handleEditGame(game)}>
            Изменить
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!isDraft || deleteGameMutation.isPending}
            onClick={() => handleDeleteGame(game)}
          >
            Удалить
          </Button>
        </div>
      </div>
      {editingGame?.event_game_id === game.event_game_id && (
        <form className="mt-4 border-t border-[var(--color-brand-line)] pt-4" onSubmit={handleUpdateGame}>
          <ConfigInputs
            form={updateConfigForm}
            setForm={setUpdateConfigForm}
            questionStats={editingGameTemplate?.question_stats}
            disabled={!isDraft}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="submit" disabled={!isDraft || !updateEventGameId || updateGameMutation.isPending}>
              {updateGameMutation.isPending ? "Сохранение..." : "Сохранить правила"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingGame(null)}>
              Отменить
            </Button>
          </div>
          {updateGameMutation.error && (
            <ErrorMessage
              className="mt-3"
              message={getErrorMessage(updateGameMutation.error, "Не удалось обновить правила игры")}
            />
          )}
        </form>
      )}
    </div>
  );

  useEffect(() => {
    if (!hasEventChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasEventChanges]);

  return (
    <RequireAuth allowedRoles={["admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-14">
        <Container>
          <div className="py-4 sm:py-8 lg:py-10">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBackToEvents}
              className="-ml-3 mb-4 min-h-10 gap-2 px-3 text-[14px] text-[var(--color-brand-muted)] hover:bg-white/70"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              К админ-панели
            </Button>

            <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-7 lg:p-8">
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  {status && (
                    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium leading-[18px]", status.className)}>
                      <span className={clsx("h-1.5 w-1.5 rounded-full", status.dot)} aria-hidden />
                      {status.label}
                    </span>
                  )}
                </div>
                <h1 className="mt-4 text-[30px] font-bold leading-9 text-[var(--color-brand-ink)] sm:text-[44px] sm:leading-[48px]">
                  {event?.title || currentEventForm.title || "Настройка мероприятия"}
                </h1>
                <Typography className="mt-3 text-[var(--color-brand-graphite)]" size="sm">
                  {saveStatusText}
                </Typography>
              </div>
            </section>

            <div
              role="tablist"
              aria-label="Разделы настройки мероприятия"
              className="sticky top-16 z-20 -mx-4 mt-4 flex gap-2 overflow-x-auto border-y border-[var(--color-brand-line)] bg-[var(--color-brand-mist)]/95 px-4 py-3 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:rounded-[var(--radius-lg)] sm:border sm:bg-white sm:shadow-[var(--shadow-card)] [&::-webkit-scrollbar]:hidden"
            >
              {tabs.map((tab) => (
                <SettingsTabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                  onSelect={() => selectTab(tab.id)}
                />
              ))}
            </div>

            <div className="mt-5 space-y-5">

          {eventQuery.isLoading && <LoadingState message="Загрузка мероприятия..." />}

          {eventQuery.error && (
            <ErrorMessage
              message={getErrorMessage(eventQuery.error, "Не удалось загрузить мероприятие")}
              actionLabel={eventQuery.isFetching ? "Повторяем..." : "Повторить"}
              onAction={() => eventQuery.refetch()}
            />
          )}

          {clientError && (
            <Typography className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-red-700" size="sm">
              {clientError}
            </Typography>
          )}

          {activeTab === "details" && (
          <Card className="border-0" id="settings-panel-details" role="tabpanel" aria-labelledby="settings-tab-details">
            <Typography as="h2" size="lg" weight="bold">
              Основное
            </Typography>
            {isArchived && (
              <Typography className="mt-2 text-red-700" size="sm">
                Мероприятие в архиве. Изменения заблокированы на сервере.
              </Typography>
            )}
            {hasEventChanges && (
            <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-brand-line)] bg-[var(--color-brand-panel)] p-3">
              <Typography size="sm" className="text-neutral-700">
                Несохраненные изменения: {changedEventFieldLabels.join(", ")}.
              </Typography>
            </div>
            )}
            <form className="mt-4 space-y-6" onSubmit={handleEventSubmit}>
              <section className="space-y-4">
                <div>
                  <Typography as="h3" weight="bold">
                    Описание
                  </Typography>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Название мероприятия"
                    value={currentEventForm.title}
                    onChange={(e) => updateEventField("title", e.target.value)}
                    error={eventFieldErrors.title}
                    disabled={!canEditDraftFields}
                    required
                  />
                  <Textarea
                    label="Описание для участников"
                    value={currentEventForm.description}
                    onChange={(e) => updateEventField("description", e.target.value)}
                    error={eventFieldErrors.description}
                    disabled={!canEditDraftFields}
                    className="md:min-h-10"
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-[var(--color-brand-line)] pt-5">
                <div>
                  <Typography as="h3" weight="bold">
                    Расписание
                  </Typography>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Начало"
                    type="text"
                    inputMode="numeric"
                    placeholder="дд.мм.гггг чч:мм"
                    value={currentEventForm.start_time}
                    onChange={(e) => updateEventField("start_time", e.target.value)}
                    error={eventFieldErrors.start_time}
                    disabled={!canEditScheduleFields}
                  />
                  <Input
                    label="Окончание"
                    type="text"
                    inputMode="numeric"
                    placeholder="дд.мм.гггг чч:мм"
                    value={currentEventForm.end_time}
                    onChange={(e) => updateEventField("end_time", e.target.value)}
                    error={eventFieldErrors.end_time}
                    disabled={!canEditScheduleFields}
                  />
                  <Select
                    label="Часовой пояс расписания"
                    value={currentEventForm.timezone}
                    onChange={(e) => updateEventField("timezone", e.target.value)}
                    error={eventFieldErrors.timezone}
                    disabled={!canEditScheduleFields}
                  >
                    <option value="">Выберите часовой пояс</option>
                    {timezoneOptions.map((timezone) => (
                      <option key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </section>

              <section className="space-y-4 border-t border-[var(--color-brand-line)] pt-5">
                <div>
                  <Typography as="h3" weight="bold">
                    Награды
                  </Typography>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Порог малого приза, %"
                    type="number"
                    min={1}
                    max={100}
                    value={currentEventForm.small_reward_percent}
                    onChange={(e) => updateEventField("small_reward_percent", e.target.value)}
                    error={eventFieldErrors.small_reward_percent}
                    disabled={!canEditRewardFields}
                  />
                  <Input
                    label="Порог большого приза, %"
                    type="number"
                    min={1}
                    max={100}
                    value={currentEventForm.big_reward_percent}
                    onChange={(e) => updateEventField("big_reward_percent", e.target.value)}
                    error={eventFieldErrors.big_reward_percent}
                    disabled={!canEditRewardFields}
                  />
                </div>
              </section>

              <div className="flex flex-wrap gap-3 border-t border-[var(--color-brand-line)] pt-5">
                <Button type="submit" disabled={!canSaveDetails || isSavingDetails}>
                  {isSavingDetails ? "Сохранение..." : primaryDetailsActionLabel}
                </Button>
                {hasEventChanges && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEventForm(null);
                      setEventFieldErrors({});
                    }}
                  >
                    Отменить изменения
                  </Button>
                )}
              </div>
            </form>
            {eventError && (
              <ErrorMessage className="mt-3" message={getErrorMessage(eventError, "Не удалось сохранить мероприятие")} />
            )}
          </Card>
          )}

          {activeTab === "directions" && (
          <Card className="border-0" id="settings-panel-directions" role="tabpanel" aria-labelledby="settings-tab-directions">
            <Typography as="h2" size="lg" weight="bold">
              Направления
            </Typography>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleAddDirection}>
                <Select
                  label="Добавить направление"
                  value={directionId}
                  onChange={(e) => setDirectionId(e.target.value)}
                  required
                >
                  <option value="">Выберите направление</option>
                  {availableDirections.map((direction) => (
                    <option key={direction.direction_id} value={direction.direction_id}>
                      {direction.name}
                    </option>
                  ))}
                </Select>
                <Button type="submit" disabled={!isDraft || addDirectionMutation.isPending}>
                  {addDirectionMutation.isPending ? "Добавление..." : "Добавить"}
                </Button>
              </form>
              <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleRemoveDirection}>
                <Select
                  label="Удалить направление"
                  value={removeDirectionId}
                  onChange={(e) => setRemoveDirectionId(e.target.value)}
                  required
                >
                  <option value="">Выберите направление</option>
                  {eventDirections.map((direction) => (
                    <option key={direction.direction_id} value={direction.direction_id}>
                      {direction.name}
                    </option>
                  ))}
                </Select>
                <Button type="submit" variant="secondary" disabled={!isDraft || removeDirectionMutation.isPending}>
                  {removeDirectionMutation.isPending ? "Удаление..." : "Удалить"}
                </Button>
              </form>
            </div>
            {adminDirectionsQuery.isLoading && (
              <Typography className="mt-3 text-neutral-600" size="sm">
                Ищем направления...
              </Typography>
            )}
            {!adminDirectionsQuery.isLoading && availableDirections.length === 0 && (
              <Typography className="mt-3 text-neutral-600" size="sm">
                Все доступные направления уже добавлены или каталог пуст.
              </Typography>
            )}
            {adminDirectionsQuery.error && (
              <ErrorMessage
                className="mt-3"
                message={getErrorMessage(adminDirectionsQuery.error, "Не удалось загрузить каталог направлений")}
              />
            )}
            {eventDirections.length === 0 && (
              <Typography className="mt-3 text-neutral-600" size="sm">
                У мероприятия пока нет привязанных направлений.
              </Typography>
            )}
            {(addDirectionMutation.error || removeDirectionMutation.error) && (
              <ErrorMessage
                className="mt-3"
                message={getErrorMessage(addDirectionMutation.error ?? removeDirectionMutation.error, "Не удалось изменить направления")}
              />
            )}
          </Card>
          )}

          {activeTab === "games" && (
          <>
          <Card className="border-0" id="settings-panel-games" role="tabpanel" aria-labelledby="settings-tab-games">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Typography as="h2" size="lg" weight="bold">
                Игры
              </Typography>
              <Select
                aria-label="Тип шаблона"
                className="w-full sm:w-auto"
                value={templateEngine}
                onChange={(e) => setTemplateEngine(e.target.value as GameEngine | "all")}
              >
                <option value="all">{engineLabels.all}</option>
                <option value="quiz">{engineLabels.quiz}</option>
                <option value="question_answer">{engineLabels.question_answer}</option>
              </Select>
            </div>
            <Typography className="mt-1 text-[var(--color-brand-graphite)]" size="sm">
              Выберите направление, шаблон и правила начисления баллов.
            </Typography>

            <form className="mt-4 space-y-4" onSubmit={handleAttach}>
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Направление"
                  value={attachDirectionId}
                  onChange={(e) => setAttachDirectionId(e.target.value)}
                  required
                >
                  <option value="">Выберите направление</option>
                  {eventDirections.map((direction) => (
                    <option key={direction.direction_id} value={direction.direction_id}>
                      {direction.name}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Шаблон игры"
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    applyTemplateDefaults(e.target.value);
                  }}
                  required
                >
                  <option value="">Выберите шаблон</option>
                  {templatesQuery.data?.data.map((template) => (
                    <option key={template.game_template_id} value={template.game_template_id}>
                      {template.title} ({engineLabels[template.engine]})
                    </option>
                  ))}
                </Select>
              </div>

              {selectedTemplate && (
                <div className="rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-3">
                  <Typography className="text-[var(--color-brand-graphite)]" size="sm">
                    {selectedTemplate.description}
                  </Typography>
                  <Typography className="mt-2 text-neutral-600" size="sm">
                    В шаблоне: легкие {selectedTemplate.question_stats.easy}, средние{" "}
                    {selectedTemplate.question_stats.medium}, сложные {selectedTemplate.question_stats.hard}, всего{" "}
                    {selectedTemplate.question_stats.total}
                  </Typography>
                </div>
              )}

              <ConfigInputs
                form={configForm}
                setForm={setConfigForm}
                questionStats={selectedTemplate?.question_stats}
                disabled={!isDraft}
              />

              <Button type="submit" disabled={!isDraft || attachMutation.isPending || !selectedTemplateId}>
                {attachMutation.isPending ? "Добавление..." : "Добавить"}
              </Button>
            </form>
            {attachMutation.error && (
              <ErrorMessage className="mt-3" message={getErrorMessage(attachMutation.error, "Не удалось добавить игру")} />
            )}
          </Card>

              <Card className="border-0">
                <Typography as="h2" size="lg" weight="bold">
                  Добавленные игры
                </Typography>
                {eventGames.length === 0 ? (
                  <Typography className="mt-3 text-neutral-600" size="sm">
                    В мероприятии пока нет игр.
                  </Typography>
                ) : (
                  <div className="mt-4 grid gap-5">
                    {gamesByDirection.map(({ direction, games }) => (
                      <section key={direction.direction_id} className="border-t border-[var(--color-brand-line)] pt-4 first:border-t-0 first:pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Typography weight="bold">{direction.name}</Typography>
                          <span className="rounded-full bg-[var(--color-brand-panel)] px-3 py-1 text-[13px] text-[var(--color-brand-muted)]">
                            Игр: {games.length}
                          </span>
                        </div>
                        {games.length === 0 ? (
                          <Typography className="mt-3 text-neutral-600" size="sm">
                            В этом направлении пока нет игр.
                          </Typography>
                        ) : (
                          <div className="mt-3 grid gap-3">{games.map(renderEventGame)}</div>
                        )}
                      </section>
                    ))}
                    {gamesWithoutDirection.length > 0 && (
                      <section className="border-t border-[var(--color-brand-line)] pt-4">
                        <Typography weight="bold">Без привязанного направления</Typography>
                        <div className="mt-3 grid gap-3">{gamesWithoutDirection.map(renderEventGame)}</div>
                      </section>
                    )}
                  </div>
                )}
                {deleteGameMutation.error && (
                  <ErrorMessage className="mt-3" message={getErrorMessage(deleteGameMutation.error, "Не удалось удалить игру")} />
                )}
              </Card>

          </>
          )}

          {activeTab === "publish" && (
          <>
          <Card className="border-0" id="settings-panel-publish" role="tabpanel" aria-labelledby="settings-tab-publish">
            <Typography as="h2" size="lg" weight="bold">
              Публикация
            </Typography>
            <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Typography size="sm" weight="bold" className="text-[var(--color-brand-ink)]">
                  {isDraft ? (publishReady ? "Готово к запуску" : "Публикация пока недоступна") : status?.label ?? "Статус мероприятия"}
                </Typography>
                <Typography className="mt-1 text-[var(--color-brand-graphite)]" size="sm">
                  {isDraft
                    ? hasEventChanges
                      ? "Сохраните изменения."
                      : publishReady
                        ? "Можно публиковать."
                        : "Исправьте пункты ниже."
                    : eventLifecycleSummary}
                </Typography>
              </div>
              {isDraft && (
                <Button
                  type="button"
                  onClick={() => publishMutation.mutate()}
                  disabled={!publishReady || publishMutation.isPending}
                >
                  {publishMutation.isPending ? "Публикация..." : "Опубликовать"}
                </Button>
              )}
            </div>
            {isDraft && (
              <div className="mt-4 grid gap-3">
                {publishChecklist.map((item) => (
                  <div
                    key={item.id}
                    className={clsx(
                      "flex flex-col gap-3 rounded-[var(--radius-md)] border p-4 sm:flex-row sm:items-center sm:justify-between",
                      item.ready ? "border-emerald-200 bg-emerald-50" : "border-[var(--color-brand-line)] bg-white"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Typography weight="bold">{item.label}</Typography>
                        <span
                          className={clsx(
                            "rounded-full px-2.5 py-1 text-[12px] font-semibold leading-4",
                            item.ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {item.ready ? "Готово" : "Нужно исправить"}
                        </span>
                      </div>
                      {!item.ready && item.issues.length === 0 && (
                        <Typography className="mt-1 text-[var(--color-brand-graphite)]" size="sm">
                          {item.fallback}
                        </Typography>
                      )}
                      {item.issues.length > 0 && (
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-700">
                          {item.issues.map((detail) => (
                            <li key={`${detail.section}-${detail.field ?? "event"}-${detail.code}`}>
                              {detail.field ? `${publishFieldLabels[detail.field] ?? "поле"}: ` : ""}
                              {localizeErrorText(detail.message, "Проверьте настройки публикации.")}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {item.id !== "publish" && !item.ready && (
                      <Button type="button" variant="ghost" className="self-start sm:self-auto" onClick={() => selectTab(item.id)}>
                        Перейти
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {eventError && (
              <ErrorMessage className="mt-3" message={getErrorMessage(eventError, "Не удалось выполнить действие")} />
            )}
          </Card>

          <ArchivePanel
            isArchived={isArchived}
            isPending={archiveMutation.isPending}
            error={archiveMutation.error}
            onArchive={handleArchive}
          />
          </>
          )}
            </div>
          </div>
        </Container>
        <ConfirmationDialog
          state={confirmDialog}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={() => {
            const action = confirmDialog?.onConfirm;
            setConfirmDialog(null);
            action?.();
          }}
        />
      </div>
    </RequireAuth>
  );
}

function SettingsTabButton({
  tab,
  isActive,
  onKeyDown,
  onSelect,
}: {
  tab: { id: EventSettingsTab; label: string; hint: string; badge?: string | number; hasIssue?: boolean };
  isActive: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onSelect: () => void;
}) {
  return (
    <button
      id={`settings-tab-${tab.id}`}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`settings-panel-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={clsx(
        "min-h-[56px] w-[172px] shrink-0 rounded-[var(--radius-md)] px-4 py-2 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]",
        isActive
          ? "bg-[var(--color-brand-ink)] text-white shadow-sm"
          : "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)] hover:bg-[#e7e9ee]"
      )}
    >
      <span className="flex items-center gap-2 text-[14px] font-semibold leading-5">
        {tab.label}
        {tab.badge !== undefined && (
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[12px] leading-4",
              isActive ? "bg-white/15 text-white" : "bg-white text-[var(--color-brand-muted)]"
            )}
          >
            {tab.badge}
          </span>
        )}
        {tab.hasIssue && <span className={clsx("h-2 w-2 rounded-full", isActive ? "bg-[var(--color-brand-yellow)]" : "bg-[#d04437]")} />}
      </span>
      <span className={clsx("mt-0.5 block text-[12px] leading-4", isActive ? "text-white/72" : "text-[var(--color-brand-muted)]")}>
        {tab.hint}
      </span>
    </button>
  );
}

function ConfirmationDialog({
  state,
  onCancel,
  onConfirm,
}: {
  state: ConfirmDialogState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!state) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.getElementById("admin-confirm-cancel")?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onCancel, state]);

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,17,20,0.48)] px-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="w-full max-w-[440px] rounded-[var(--radius-lg)] bg-white p-5 shadow-[0_24px_60px_rgba(16,17,20,0.22)] sm:p-6"
      >
        <Typography id="admin-confirm-title" as="h2" size="lg" weight="bold">
          {state.title}
        </Typography>
        <Typography className="mt-2 text-neutral-600" size="sm">
          {state.message}
        </Typography>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button id="admin-confirm-cancel" type="button" variant="secondary" onClick={onCancel}>
            Отменить
          </Button>
          <Button type="button" variant={state.tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {state.confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
