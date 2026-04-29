import clsx from "clsx";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Typography from "@/components/ui/Typography";
import { getErrorMessage, localizeErrorText } from "@/lib/getErrorMessage";
import ArchivePanel from "./ArchivePanel";
import type { PublishChecklistItem } from "./eventPresentation";
import { publishFieldLabels } from "./labels";
import type { AdminEventSettingsTab } from "./SettingsTabButton";

type PublishPanelProps = {
  isDraft: boolean;
  isArchived: boolean;
  publishReady: boolean;
  hasEventChanges: boolean;
  publishChecklist: PublishChecklistItem[];
  statusLabel?: string | undefined;
  eventLifecycleSummary: string;
  isPublishPending: boolean;
  isArchivePending: boolean;
  eventError: unknown;
  archiveError: unknown;
  onPublish: () => void;
  onArchive: () => void;
  onSelectTab: (tab: AdminEventSettingsTab) => void;
};

export default function PublishPanel({
  isDraft,
  isArchived,
  publishReady,
  hasEventChanges,
  publishChecklist,
  statusLabel,
  eventLifecycleSummary,
  isPublishPending,
  isArchivePending,
  eventError,
  archiveError,
  onPublish,
  onArchive,
  onSelectTab,
}: PublishPanelProps) {
  return (
    <>
      <Card className="border-0" id="settings-panel-publish" role="tabpanel" aria-labelledby="settings-tab-publish">
        <Typography as="h2" size="lg" weight="bold">
          Публикация
        </Typography>
        <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography size="sm" weight="bold" className="text-[var(--color-brand-ink)]">
              {isDraft ? (publishReady ? "Готово к запуску" : "Публикация пока недоступна") : statusLabel ?? "Статус мероприятия"}
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
            <Button type="button" onClick={onPublish} disabled={!publishReady || isPublishPending}>
              {isPublishPending ? "Публикация..." : "Опубликовать"}
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
                  item.ready ? "border-emerald-200 bg-emerald-50" : "border-[var(--color-brand-line)] bg-white",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography weight="bold">{item.label}</Typography>
                    <span
                      className={clsx(
                        "rounded-full px-2.5 py-1 text-[12px] font-semibold leading-4",
                        item.ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
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
                  <Button type="button" variant="ghost" className="self-start sm:self-auto" onClick={() => onSelectTab(item.id)}>
                    Перейти
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {Boolean(eventError) && <ErrorMessage className="mt-3" message={getErrorMessage(eventError, "Не удалось выполнить действие")} />}
      </Card>

      <ArchivePanel isArchived={isArchived} isPending={isArchivePending} error={archiveError} onArchive={onArchive} />
    </>
  );
}
