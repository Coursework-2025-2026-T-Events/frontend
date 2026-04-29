import type { PublishReadinessIssueDTO } from "@/lib/api/types";
import type { AdminEventSettingsTab } from "./SettingsTabButton";
import { statusLabels } from "./labels";

export type AdminEventStatusTone = {
  label: string;
  className: string;
  dot: string;
};

export type PublishChecklistItem = {
  id: AdminEventSettingsTab;
  label: string;
  fallback: string;
  ready: boolean;
  issues: PublishReadinessIssueDTO[];
};

type PublishChecklistInput = {
  detailsReady: boolean;
  directionsReady: boolean;
  gamesReady: boolean;
  publishIssuesBySection: Record<AdminEventSettingsTab, PublishReadinessIssueDTO[]>;
};

const statusTone: Record<string, AdminEventStatusTone> = {
  draft: { label: "Черновик", className: "bg-[#f1f3f6] text-[var(--color-brand-graphite)]", dot: "bg-[#8a94a6]" },
  published: { label: "Опубликовано", className: "bg-[#eef5ff] text-[#126df7]", dot: "bg-[#126df7]" },
  active: { label: "Активно", className: "bg-[#eaf7ee] text-[#237a3b]", dot: "bg-[#35b55b]" },
  finished: { label: "Завершено", className: "bg-[#fff7cf] text-[var(--color-brand-ink)]", dot: "bg-[#d9a900]" },
  archived: { label: "Архив", className: "bg-[#fdecec] text-[#b42318]", dot: "bg-[#d04437]" },
};

const fallbackStatusTone: Omit<AdminEventStatusTone, "label"> = {
  className: "bg-[#f1f3f6] text-[var(--color-brand-graphite)]",
  dot: "bg-[#8a94a6]",
};

export function getStatusTone(status?: string): AdminEventStatusTone | null {
  if (!status) return null;
  return statusTone[status] ?? { label: statusLabels[status] ?? status, ...fallbackStatusTone };
}

export function getEventLifecycleSummary(status?: string): string {
  switch (status) {
    case "draft":
      return "Черновик можно редактировать и готовить к публикации.";
    case "published":
      return "Мероприятие опубликовано, но еще не началось. До старта можно изменить расписание.";
    case "active":
      return "Мероприятие активно и доступно участникам.";
    case "finished":
      return "Мероприятие завершено по расписанию.";
    case "archived":
      return "Мероприятие находится в архиве. Бизнес-операции недоступны.";
    default:
      return "Текущий статус мероприятия получен с сервера.";
  }
}

export function getDetailsActionLabel(status?: string): string {
  return status === "published" ? "Обновить расписание" : "Сохранить изменения";
}

export function getSaveStatusText(hasEventChanges: boolean, lastSavedAt: Date | null): string {
  if (hasEventChanges) {
    return "Есть несохраненные изменения. Проверка публикации обновится после сохранения.";
  }

  if (lastSavedAt) {
    return `Сохранено ${lastSavedAt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return "Изменения сохраняются вручную.";
}

export function buildPublishChecklist({
  detailsReady,
  directionsReady,
  gamesReady,
  publishIssuesBySection,
}: PublishChecklistInput): PublishChecklistItem[] {
  return [
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
            id: "publish" as AdminEventSettingsTab,
            label: "Проверка",
            fallback: "Проверьте настройки публикации.",
            ready: false,
            issues: publishIssuesBySection.publish,
          },
        ]
      : []),
  ];
}
