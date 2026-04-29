import type { AdminEventSettingsTab, AdminEventSettingsTabItem } from "./SettingsTabButton";

type BuildEventSettingsTabsInput = {
  isDraft: boolean;
  isEventLoaded: boolean;
  detailsReady: boolean;
  directionsReady: boolean;
  gamesReady: boolean;
  directionCount: number;
  gameCount: number;
  publishIssueCount: number;
};

export function buildEventSettingsTabs({
  isDraft,
  isEventLoaded,
  detailsReady,
  directionsReady,
  gamesReady,
  directionCount,
  gameCount,
  publishIssueCount,
}: BuildEventSettingsTabsInput): AdminEventSettingsTabItem[] {
  return [
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
      hasIssue: isDraft && publishIssueCount > 0,
    },
  ];
}

export function getNextEventSettingsTab(
  tabs: AdminEventSettingsTabItem[],
  currentTab: AdminEventSettingsTab,
  key: string,
): AdminEventSettingsTab | null {
  const tabIds = tabs.map((tab) => tab.id);
  const currentIndex = tabIds.indexOf(currentTab);

  if (currentIndex === -1) return null;
  if (key === "Home") return tabIds[0] ?? null;
  if (key === "End") return tabIds.at(-1) ?? null;
  if (key === "ArrowRight") return tabIds[(currentIndex + 1) % tabIds.length] ?? null;
  if (key === "ArrowLeft") return tabIds[(currentIndex - 1 + tabIds.length) % tabIds.length] ?? null;

  return null;
}
