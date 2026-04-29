import type { FormEvent } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/ui/ErrorMessage";
import FormErrorSummary, { type FormErrorSummaryItem } from "@/components/ui/FormErrorSummary";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Typography from "@/components/ui/Typography";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { timezoneOptions } from "./eventDateTime";
import type { AdminEventFieldErrors, AdminEventForm, AdminEventFormField } from "./eventForm";

const eventFieldSummary: Record<AdminEventFormField, { label: string; fieldId: string }> = {
  title: { label: "Название мероприятия", fieldId: "event-title" },
  description: { label: "Описание для участников", fieldId: "event-description" },
  start_time: { label: "Начало", fieldId: "event-start-time" },
  end_time: { label: "Окончание", fieldId: "event-end-time" },
  timezone: { label: "Часовой пояс расписания", fieldId: "event-timezone" },
  small_reward_percent: { label: "Порог малого приза", fieldId: "event-small-reward-percent" },
  big_reward_percent: { label: "Порог большого приза", fieldId: "event-big-reward-percent" },
};

type EventDetailsFormProps = {
  form: AdminEventForm;
  fieldErrors: AdminEventFieldErrors;
  changedFieldLabels: string[];
  hasEventChanges: boolean;
  isArchived: boolean;
  canEditDraftFields: boolean;
  canEditScheduleFields: boolean;
  canEditRewardFields: boolean;
  canSaveDetails: boolean;
  isSavingDetails: boolean;
  primaryActionLabel: string;
  eventError: unknown;
  onFieldChange: (field: AdminEventFormField, value: string) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function EventDetailsForm({
  form,
  fieldErrors,
  changedFieldLabels,
  hasEventChanges,
  isArchived,
  canEditDraftFields,
  canEditScheduleFields,
  canEditRewardFields,
  canSaveDetails,
  isSavingDetails,
  primaryActionLabel,
  eventError,
  onFieldChange,
  onReset,
  onSubmit,
}: EventDetailsFormProps) {
  const errorSummaryItems = toEventErrorSummaryItems(fieldErrors);

  return (
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
            Несохраненные изменения: {changedFieldLabels.join(", ")}.
          </Typography>
        </div>
      )}

      <form className="mt-4 space-y-6" onSubmit={onSubmit}>
        <FormErrorSummary items={errorSummaryItems} />

        <section className="space-y-4">
          <Typography as="h3" weight="bold">
            Описание
          </Typography>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="event-title"
              label="Название мероприятия"
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              error={fieldErrors.title}
              disabled={!canEditDraftFields}
              required
            />
            <Textarea
              id="event-description"
              label="Описание для участников"
              value={form.description}
              onChange={(event) => onFieldChange("description", event.target.value)}
              error={fieldErrors.description}
              disabled={!canEditDraftFields}
              className="md:min-h-10"
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-[var(--color-brand-line)] pt-5">
          <Typography as="h3" weight="bold">
            Расписание
          </Typography>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="event-start-time"
              label="Начало"
              type="text"
              inputMode="numeric"
              placeholder="дд.мм.гггг чч:мм"
              value={form.start_time}
              onChange={(event) => onFieldChange("start_time", event.target.value)}
              error={fieldErrors.start_time}
              disabled={!canEditScheduleFields}
            />
            <Input
              id="event-end-time"
              label="Окончание"
              type="text"
              inputMode="numeric"
              placeholder="дд.мм.гггг чч:мм"
              value={form.end_time}
              onChange={(event) => onFieldChange("end_time", event.target.value)}
              error={fieldErrors.end_time}
              disabled={!canEditScheduleFields}
            />
            <Select
              id="event-timezone"
              label="Часовой пояс расписания"
              value={form.timezone}
              onChange={(event) => onFieldChange("timezone", event.target.value)}
              error={fieldErrors.timezone}
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
          <Typography as="h3" weight="bold">
            Награды
          </Typography>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="event-small-reward-percent"
              label="Порог малого приза, %"
              type="number"
              min={1}
              max={100}
              value={form.small_reward_percent}
              onChange={(event) => onFieldChange("small_reward_percent", event.target.value)}
              error={fieldErrors.small_reward_percent}
              disabled={!canEditRewardFields}
            />
            <Input
              id="event-big-reward-percent"
              label="Порог большого приза, %"
              type="number"
              min={1}
              max={100}
              value={form.big_reward_percent}
              onChange={(event) => onFieldChange("big_reward_percent", event.target.value)}
              error={fieldErrors.big_reward_percent}
              disabled={!canEditRewardFields}
            />
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-[var(--color-brand-line)] pt-5">
          <Button type="submit" disabled={!canSaveDetails || isSavingDetails}>
            {isSavingDetails ? "Сохранение..." : primaryActionLabel}
          </Button>
          {hasEventChanges && (
            <Button type="button" variant="ghost" onClick={onReset}>
              Отменить изменения
            </Button>
          )}
        </div>
      </form>

      {Boolean(eventError) && (
        <ErrorMessage className="mt-3" message={getErrorMessage(eventError, "Не удалось сохранить мероприятие")} />
      )}
    </Card>
  );
}

function toEventErrorSummaryItems(fieldErrors: AdminEventFieldErrors): FormErrorSummaryItem[] {
  return (Object.entries(fieldErrors) as Array<[AdminEventFormField, string | undefined]>)
    .filter((entry): entry is [AdminEventFormField, string] => Boolean(entry[1]))
    .map(([field, message]) => ({
      ...eventFieldSummary[field],
      message,
    }));
}
