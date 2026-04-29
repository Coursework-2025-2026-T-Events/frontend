import clsx from "clsx";

export type AdminEventSettingsTab = "details" | "directions" | "games" | "publish";

export type AdminEventSettingsTabItem = {
  id: AdminEventSettingsTab;
  label: string;
  hint: string;
  badge?: string | number | undefined;
  hasIssue?: boolean | undefined;
};

type Props = {
  tab: AdminEventSettingsTabItem;
  isActive: boolean;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onSelect: () => void;
};

export default function SettingsTabButton({ tab, isActive, onKeyDown, onSelect }: Props) {
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
          : "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)] hover:bg-[#e7e9ee]",
      )}
    >
      <span className="flex items-center gap-2 text-[14px] font-semibold leading-5">
        {tab.label}
        {tab.badge !== undefined && (
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 text-[12px] leading-4",
              isActive ? "bg-white/15 text-white" : "bg-white text-[var(--color-brand-muted)]",
            )}
          >
            {tab.badge}
          </span>
        )}
        {tab.hasIssue && (
          <span className={clsx("h-2 w-2 rounded-full", isActive ? "bg-[var(--color-brand-yellow)]" : "bg-[#d04437]")} />
        )}
      </span>
      <span className={clsx("mt-0.5 block text-[12px] leading-4", isActive ? "text-white/72" : "text-[var(--color-brand-muted)]")}>
        {tab.hint}
      </span>
    </button>
  );
}
